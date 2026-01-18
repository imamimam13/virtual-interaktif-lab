"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface GenericVideoPlayerProps {
    url: string;
    onTimeUpdate?: (time: number) => void;
    onEnded?: () => void;
}

export interface VideoPlayerRef {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
}

const GenericVideoPlayer = forwardRef<VideoPlayerRef, GenericVideoPlayerProps>(({ url, onTimeUpdate, onEnded }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
        play: () => videoRef.current?.play(),
        pause: () => videoRef.current?.pause(),
        seekTo: (seconds: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = seconds;
            }
        },
        getCurrentTime: () => videoRef.current?.currentTime || 0,
    }));

    return (
        <div className="w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-contain"
                controls
                playsInline
                onTimeUpdate={() => {
                    if (videoRef.current && onTimeUpdate) {
                        onTimeUpdate(videoRef.current.currentTime);
                    }
                }}
                onEnded={onEnded}
            >
                Browser Anda tidak mendukung tag video.
            </video>
        </div>
    );
});

GenericVideoPlayer.displayName = "GenericVideoPlayer";
export default GenericVideoPlayer;
