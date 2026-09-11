import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayer({ src, className, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls when playing and mouse is still
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    let timeout: number;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => setShowControls(false), 2000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => setShowControls(false));
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", () => setShowControls(false));
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      ref={containerRef}
      className={cn("group relative flex items-center justify-center overflow-hidden border border-stage-line bg-black", className)}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
      />

      {/* Cinematic overlay/scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,12,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 mix-blend-overlay opacity-30" />

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/50"
        >
          <div className="flex size-16 items-center justify-center rounded-full border border-bronze/50 bg-background/20 backdrop-blur-sm text-bronze transition-transform hover:scale-110">
            <Play className="ml-1 size-6 fill-current" />
          </div>
        </button>
      )}

      {/* Custom Controls Bottom Bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div 
          className="group/progress relative h-1.5 w-full cursor-pointer bg-stage-line/50 overflow-hidden rounded-sm"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute left-0 top-0 h-full bg-bronze transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between text-stage-muted">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="hover:text-bronze transition-colors"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button 
              onClick={toggleMute}
              className="hover:text-bronze transition-colors"
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <div className="font-mono text-xs uppercase tracking-widest">
              {formatTime(currentTime)} <span className="opacity-50">/ {formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-bronze/60 hidden sm:block border border-bronze/30 px-1.5 py-0.5 rounded-sm">
              REC // CONFIDENCIAL
            </span>
            <button 
              onClick={toggleFullscreen}
              className="hover:text-bronze transition-colors"
            >
              <Maximize className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
