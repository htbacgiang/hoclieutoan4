import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();
  try {
    const conn = await connectToDatabase();
    const pingTime = Date.now() - startTime;

    const readyState = conn.connection.readyState;
    const states: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    const isConnected = readyState === 1;

    let collections: string[] = [];
    if (conn.connection.db) {
      const cols = await conn.connection.db.listCollections().toArray();
      collections = cols.map((c) => c.name);
    }

    return NextResponse.json({
      success: true,
      status: states[readyState] || 'Unknown',
      readyState,
      isConnected,
      databaseName: conn.connection.name || 'toan4_db',
      host: conn.connection.host,
      port: conn.connection.port,
      pingMs: pingTime,
      collectionsCount: collections.length,
      collections,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        status: 'Error',
        isConnected: false,
        error: msg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
