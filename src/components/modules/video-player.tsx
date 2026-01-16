"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
    content: string;
    onComplete: () => void;
}

export default function VideoPlayer({ content, onComplete }: VideoPlayerProps) {
    const [isCompleted, setIsCompleted] = useState(false);

    // Simple Youtube ID extractor (very basic)
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(content);

    return (
        <div className="flex flex-col gap-6">
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {youtubeId ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="Video Module"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        <p>Video URL not supported or invalid.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={() => { setIsCompleted(true); onComplete(); }}
                    className={`${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle className="mr-2 h-5 w-5" /> Selesai Ditonton
                        </>
                    ) : (
                        "Tandai Selesai"
                    )}
                </Button>
            </div>
        </div>
    );
}
