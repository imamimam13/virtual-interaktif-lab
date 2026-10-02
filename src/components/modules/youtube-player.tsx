"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Loader2 } from "lucide-react";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface YouTubePlayerProps {
    videoId: string;
    onReady?: () => void;
    onStateChange?: (state: number) => void;
    onTimeUpdate?: (time: number) => void;
}

export interface YouTubePlayerRef {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({ videoId, onReady, onStateChange, onTimeUpdate }, ref) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    // Keep latest callback in ref to avoid stale closure in setInterval
    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onStateChangeRef = useRef(onStateChange);

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
        onStateChangeRef.current = onStateChange;
    }, [onTimeUpdate, onStateChange]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        play: () => playerRef.current?.playVideo(),
        pause: () => playerRef.current?.pauseVideo(),
        seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
        getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
    }));

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const loadAPI = () => {
            if (!window.YT) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName("script")[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

                window.onYouTubeIframeAPIReady = initializePlayer;
            } else {
                initializePlayer();
            }
        };

        const initializePlayer = () => {
            if (playerRef.current) return; // Already initialized

            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'modestbranding': 1,
                    'rel': 0,
                    'iv_load_policy': 3,
                },
                events: {
                    'onReady': (event: any) => {
                        setLoading(false);
                        if (onReady) onReady();

                        // Start time tracking interval
                        interval = setInterval(() => {
                            if (playerRef.current && playerRef.current.getCurrentTime) {
                                const time = playerRef.current.getCurrentTime();
                                if (onTimeUpdateRef.current) onTimeUpdateRef.current(time);
                            }
                        }, 500); // Check every 500ms
                    },
                    'onStateChange': (event: any) => {
                        if (onStateChangeRef.current) onStateChangeRef.current(event.data);
                    }
                }
            });
        };

        loadAPI();

        return () => {
            if (interval) clearInterval(interval);
            // We usually don't destroy the player to avoid teardown issues with React 18 strict mode
        };
    }, [videoId]);

    return (
        <div 
            className="w-full h-full relative bg-black rounded-xl overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            <div ref={containerRef} className="w-full h-full" />
            
            {/* Anti-cheat overlays to block direct clickthrough to YouTube */}
            {/* Top overlay to block title, channel info, and share button */}
            <div 
                className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-auto cursor-default" 
                title=""
                onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom-right overlay to block 'Watch on YouTube' button / YouTube logo */}
            <div 
                className="absolute bottom-0 right-0 w-48 h-14 z-20 pointer-events-auto cursor-default" 
                title=""
                onClick={(e) => e.stopPropagation()}
            />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-30">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
        </div>
    );
});

YouTubePlayer.displayName = "YouTubePlayer";
export default YouTubePlayer;
