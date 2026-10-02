"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Maximize2, Minimize2, RotateCcw, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HtmlViewerProps {
    content: string;
    onComplete?: (score?: number) => void;
    title?: string;
}

export default function HtmlViewer({ content, onComplete, title }: HtmlViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [earnedScore, setEarnedScore] = useState<number | null>(null);
    const [key, setKey] = useState(0); // to force reload iframe
    const containerRef = useRef<HTMLDivElement>(null);

    // Determine if content is a direct URL or raw HTML markup
    const isUrl = (() => {
        const trimmed = content.trim();
        return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
    })();

    // Listen for postMessage from inner HTML / SCORM content
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (!event.data) return;

            let data = event.data;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(data);
                } catch {
                    // Not JSON string
                }
            }

            if (typeof data === "object" && data !== null) {
                const eventType = data.type || data.event || data.action;
                if (
                    eventType === "LAB_COMPLETE" ||
                    eventType === "SCORM_COMPLETE" ||
                    eventType === "VL_COMPLETE" ||
                    eventType === "SIMULATION_COMPLETE" ||
                    eventType === "QUIZ_SUBMITTED"
                ) {
                    const score = typeof data.score === "number" ? data.score : 100;
                    setEarnedScore(score);
                    setIsCompleted(true);
                    if (onComplete) {
                        onComplete(score);
                    }
                }
            }
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onComplete]);

    const handleManualComplete = () => {
        const score = earnedScore !== null ? earnedScore : 100;
        setIsCompleted(true);
        if (onComplete) {
            onComplete(score);
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        setKey(prev => prev + 1);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
        }
    };

    useEffect(() => {
        const onFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`w-full flex flex-col bg-zinc-950 text-white rounded-xl overflow-hidden border border-zinc-800 shadow-xl transition-all ${
                isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[calc(100vh-10rem)] min-h-[550px]"
            }`}
        >
            {/* Simulation Toolbar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Play className="h-3 w-3 fill-current" /> HTML5 Interactive
                    </span>
                    {title && <span className="text-xs text-zinc-400 font-medium truncate max-w-xs">{title}</span>}
                </div>

                <div className="flex items-center gap-2">
                    {isCompleted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Selesai {earnedScore !== null ? `(${earnedScore} Poin)` : ""}</span>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                            onClick={handleManualComplete}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Tandai Praktikum Selesai
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                        title="Muat Ulang Simulasi"
                        onClick={handleReload}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                        title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Viewer Canvas Area */}
            <div className="relative flex-1 w-full h-full bg-zinc-900">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
                        <div className="flex flex-col items-center gap-2 text-indigo-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-xs text-zinc-400">Memuat Modul Interaktif HTML5...</p>
                        </div>
                    </div>
                )}

                {isUrl ? (
                    <iframe
                        key={key}
                        src={content.trim()}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                    />
                ) : (
                    <iframe
                        key={key}
                        srcDoc={content}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                    />
                )}
            </div>
        </div>
    );
}
