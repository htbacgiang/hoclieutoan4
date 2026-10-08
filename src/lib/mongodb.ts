import mongoose from 'mongoose';
import dns from 'dns';

async function resolveSrvUriIfNeeded(rawUri: string): Promise<string> {
  if (!rawUri.startsWith('mongodb+srv://')) {
    return rawUri;
  }

  const match = rawUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]*)\??(.*)$/);
  if (!match) return rawUri;

  const [, user, pass, host, dbName, queryParams] = match;

  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8']);

    return await new Promise<string>((resolve) => {
      resolver.resolveSrv(`_mongodb._tcp.${host}`, (err, srvRecords) => {
        if (err || !srvRecords || srvRecords.length === 0) {
          return resolve(rawUri);
        }

        resolver.resolveTxt(host, (txtErr, txtRecords) => {
          const hostsStr = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
          let txtParams = '';
          if (txtRecords && txtRecords.length > 0) {
            const firstEntry = txtRecords[0];
            txtParams = Array.isArray(firstEntry) ? firstEntry.join('') : String(firstEntry);
          }

          const allParams = [txtParams, queryParams, 'ssl=true'].filter(Boolean).join('&');
          const resolvedUri = `mongodb://${user}:${pass}@${hostsStr}/${dbName}?${allParams}`;
          resolve(resolvedUri);
        });
      });
    });
  } catch (e) {
    console.warn('⚠️ SRV Resolution fallback engaged:', e);
    return rawUri;
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongod?: unknown;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/toan4_db';

  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = (async () => {
      let conn: typeof mongoose;
      try {
        const uriToConnect = await resolveSrvUriIfNeeded(rawUri);
        conn = await mongoose.connect(uriToConnect, opts);
        console.log('✅ CONNECTED TO MONGODB ATLAS (toan4_db) ONLINE SUCCESSFULLY!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('⚠️ Primary MongoDB Atlas connection failed:', msg);
        console.log('🔄 Starting MongoMemoryServer with disk persistence fallback...');

        try {
          if (!cached!.mongod) {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const path = await import('path');
            const fs = await import('fs');
            const dbPath = path.join(process.cwd(), '.mongo-data');
            if (!fs.existsSync(dbPath)) {
              fs.mkdirSync(dbPath, { recursive: true });
            }

            try {
              cached!.mongod = await MongoMemoryServer.create({
                instance: {
                  dbPath,
                  storageEngine: 'wiredTiger',
                },
              });
            } catch (lockErr) {
              console.warn('⚠️ Could not reuse dbPath due to lock, creating fallback memory server instance:', lockErr);
              cached!.mongod = await MongoMemoryServer.create();
            }
          }

          const mongodInstance = cached!.mongod as { getUri: () => string };
          const uri = mongodInstance.getUri();
          conn = await mongoose.connect(uri);
          console.log('✅ Connected to Persistent MongoMemoryServer at:', uri);
        } catch (memErr) {
          console.error('❌ Failed to start MongoMemoryServer fallback:', memErr);
          throw err;
        }
      }

      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
