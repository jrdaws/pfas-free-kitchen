/**
 * Hero Video Background Section
 * 
 * Full-width video background with overlay text.
 */

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export interface HeroVideoBackgroundProps {
  headline: string;
  subtext: string;
  cta: {
    text: string;
    href: string;
  };
  videoUrl: string;
  posterImage?: string;
  overlayOpacity?: number;
  showControls?: boolean;
  variant?: "dark" | "gradient";
}

export function HeroVideoBackground({
  headline,
  subtext,
  cta,
  videoUrl,
  posterImage,
  overlayOpacity = 0.6,
  showControls = true,
  variant = "dark",
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const overlayClass = variant === "gradient"
    ? "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
    : "";

  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={posterImage}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className={`absolute inset-0 ${overlayClass}`}
        style={variant === "dark" ? { backgroundColor: `rgba(0,0,0,${overlayOpacity})` } : undefined}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {headline}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-xl">
            {subtext}
          </p>

          <Link
            href={cta.href}
            className="inline-flex px-10 py-5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all text-lg shadow-2xl hover:scale-105"
          >
            {cta.text}
          </Link>
        </div>
      </div>

      {/* Video Controls */}
      {showControls && (
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroVideoBackground;

