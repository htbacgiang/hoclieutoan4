'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Subtitles,
  Loader2,
} from 'lucide-react';
import VideoThumbnailSVG from './VideoThumbnailSVG';

interface LessonVideoProps {
  videoUrl?: string;
  duration?: string;
  title?: string;
  fractionDisplay?: {
    num: string;
    den: string;
    formula?: string;
  };
}

export default function LessonVideo({
  videoUrl = 'https://res.cloudinary.com/djwdvetlr/video/upload/v1790341823/UNIQUICKDRY2_c5jifm.mp4',
  title = 'Phân số là gì?',
  fractionDisplay,
}: LessonVideoProps) {
  const isEmbed = Boolean(
    videoUrl &&
      (videoUrl.includes('player.cloudinary.com') ||
        videoUrl.includes('embed') ||
        videoUrl.includes('iframe') ||
        videoUrl.includes('youtube.com') ||
        videoUrl.includes('vimeo.com'))
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic video metadata duration listener
  useEffect(() => {
    if (isEmbed) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('canplay', updateDuration);

    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      updateDuration();
    }

    return () => {
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('canplay', updateDuration);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Video play error:', err);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration) && duration === 0) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPct = clickX / rect.width;
    const newTime = newPct * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-blue-100/80 bg-slate-950 group select-none">
      {/* Cloudinary Player Embed Iframe */}
      {isEmbed ? (
        <iframe
          src={videoUrl}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : videoUrl ? (
        /* Direct HTML5 Video Player */
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          preload="auto"
          muted={isMuted}
          className="w-full h-full object-contain bg-black cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onClick={togglePlay}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <VideoThumbnailSVG
            title={title}
            num={fractionDisplay?.num}
            den={fractionDisplay?.den}
            formula={fractionDisplay?.formula}
          />
        </div>
      )}

      {/* Custom controls overlay for HTML5 videos */}
      {!isEmbed && (
        <>
          {/* Dim Overlay when video is paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors pointer-events-none" />
          )}

          {/* Loading Spinner */}
          {isLoading && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}

          {/* Center Big Play Button Overlay (when paused) */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              aria-label="Phát video bài giảng"
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1677D2]/90 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:bg-[#1261B5] ring-4 ring-white/30">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white translate-x-0.5" />
              </div>
            </button>
          )}

          {/* Bottom Video Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-8 pb-3 px-4 sm:px-6 space-y-2">
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              className="w-full h-1.5 hover:h-2.5 bg-white/30 rounded-full cursor-pointer overflow-hidden transition-all duration-150"
            >
              <div
                className="h-full bg-[#1677D2] rounded-full transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm font-medium">
              {/* Left Controls: Play/Pause, Volume, Timer */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                  className="hover:text-blue-300 transition-colors p-1 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  className="hover:text-blue-300 transition-colors p-1 cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>

                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-200">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls: Subtitles, Settings, Fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3.5">
                <button
                  aria-label="Phụ đề"
                  className="hover:text-blue-300 transition-colors p-1 cursor-pointer"
                  title="Phụ đề Tiếng Việt"
                >
                  <Subtitles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200 hover:text-white" />
                </button>

                <button
                  aria-label="Cài đặt"
                  className="hover:text-blue-300 transition-colors p-1 cursor-pointer"
                  title="Cài đặt video"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200 hover:text-white" />
                </button>

                <button
                  onClick={handleFullscreen}
                  aria-label="Toàn màn hình"
                  className="hover:text-blue-300 transition-colors p-1 cursor-pointer"
                  title="Toàn màn hình"
                >
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
