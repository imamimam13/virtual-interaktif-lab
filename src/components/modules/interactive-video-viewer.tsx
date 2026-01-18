"use client";

import { useState, useRef, useEffect } from "react";
import YouTubePlayer, { YouTubePlayerRef } from "./youtube-player";
import GenericVideoPlayer, { VideoPlayerRef } from "./generic-video-player";
import QuizRunner from "./quiz-runner";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Example JSON Format:
// {
//   "videoUrl": "https://youtu.be/VIDEO_ID",
//   "questions": [
//     { "timestamp": 60, "question": "What just happened?", "options": ["A", "B"], "answer": 0 },
//     { "timestamp": 120, "question": "Next step?", "options": ["X", "Y"], "answer": 1 }
//   ]
// }

interface InteractiveQuestion {
    timestamp: number; // Seconds
    question: string;
    options: string[];
    answer: number;
}

interface InteractiveVideoContent {
    videoUrl: string;
    questions: InteractiveQuestion[];
}

interface InteractiveVideoViewerProps {
    content: string;
    onComplete: () => void;
}

export default function InteractiveVideoViewer({ content, onComplete }: InteractiveVideoViewerProps) {
    const [data, setData] = useState<InteractiveVideoContent | null>(null);
    const [parsed, setParsed] = useState(false);

    // We can use a union ref type or just 'any' for simplicity if methods match
    const playerRef = useRef<YouTubePlayerRef | VideoPlayerRef>(null);

    // State
    const [currentTime, setCurrentTime] = useState(0);
    const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
    const [activeQuestion, setActiveQuestion] = useState<InteractiveQuestion | null>(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(-1);
    const [isPausedForQuestion, setIsPausedForQuestion] = useState(false);

    // Init Data
    useEffect(() => {
        try {
            const parsedData = JSON.parse(content);
            // Sort questions by timestamp just in case
            if (parsedData.questions) {
                parsedData.questions.sort((a: any, b: any) => a.timestamp - b.timestamp);
            }
            setData(parsedData);
            setParsed(true);
        } catch (e) {
            console.error("JSON Parse Error", e);
        }
    }, [content]);

    // Helper to extract ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Time Update Handler
    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);

        if (!data || !data.questions || isPausedForQuestion) return;

        // Check for questions within 1.5 second window
        const questionIdx = data.questions.findIndex((q, idx) => {
            const timeDiff = Math.abs(q.timestamp - time);
            return timeDiff < 1.5 && !completedQuestions.has(idx);
        });

        if (questionIdx !== -1) {
            const question = data.questions[questionIdx];
            triggerQuestion(question, questionIdx);
        }
    };

    const triggerQuestion = (q: InteractiveQuestion, idx: number) => {
        setIsPausedForQuestion(true);
        setActiveQuestion(q);
        setActiveQuestionIndex(idx);
        playerRef.current?.pause();
    };

    const handleQuestionComplete = (score: number) => {
        // Add to completed set
        setCompletedQuestions(prev => new Set(prev).add(activeQuestionIndex));

        // Close modal and resume
        setActiveQuestion(null);
        setActiveQuestionIndex(-1);
        setIsPausedForQuestion(false);
        playerRef.current?.play();

        // Check if all done (optional: call onComplete if video ends? Handled by user finishing video mostly)
        if (data && completedQuestions.size + 1 >= data.questions.length) {
            onComplete(); // Or partially complete
        }
    };

    const handleResume = () => {
        setIsPausedForQuestion(false);
        playerRef.current?.play();
    };

    if (!parsed || !data) return <div className="text-red-500">Error loading content.</div>;

    // Determine Player Type
    const youtubeId = getYoutubeId(data.videoUrl);
    const isYoutube = !!youtubeId;

    return (
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Video Section */}
            <div className="lg:col-span-2 flex flex-col gap-4 relative">
                <Card className="flex-1 overflow-hidden bg-black p-0 border-0 rounded-xl shadow-lg relative group">
                    {isYoutube ? (
                        <YouTubePlayer
                            ref={playerRef as React.Ref<YouTubePlayerRef>}
                            videoId={youtubeId!}
                            onTimeUpdate={handleTimeUpdate}
                        />
                    ) : (
                        <GenericVideoPlayer
                            ref={playerRef as React.Ref<VideoPlayerRef>}
                            url={data.videoUrl}
                            onTimeUpdate={handleTimeUpdate}
                        />
                    )}

                    {/* Overlay when paused for question */}
                    {isPausedForQuestion && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                            <div className="text-white text-center animate-in fade-in zoom-in duration-300">
                                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                                <h2 className="text-2xl font-bold mb-2">Waktunya Kuis!</h2>
                                <p>Jawab pertanyaan di panel samping (atau popup) untuk lanjut.</p>
                            </div>
                        </div>
                    )}
                </Card>

                <div className="px-1 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Interactive Video</h3>
                        <p className="text-sm text-muted-foreground">
                            {isYoutube ? "YouTube Source" : "Direct Video Source"} • Video akan otomatis berhenti saat ada pertanyaan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Questions List / Active Sidebar */}
            <div className="lg:col-span-1 h-full relative">
                <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900/50">
                    <div className="p-4 border-b bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            Timeline Pertanyaan
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                            {data.questions.map((q, idx) => {
                                const isCompleted = completedQuestions.has(idx);
                                const isCurrent = activeQuestionIndex === idx;
                                const timeSec = Number(q.timestamp) || 0;
                                const minutes = Math.floor(timeSec / 60);
                                const seconds = (timeSec % 60).toString().padStart(2, '0');

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            // Optional: Allow re-opening if needed, or jump to timestamp
                                            if (!isCompleted) {
                                                playerRef.current?.seekTo(q.timestamp);
                                            }
                                        }}
                                        className={`p-3 rounded-lg border text-sm transition-all cursor-pointer flex items-center justify-between
                                            ${isCurrent ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}
                                            ${isCompleted ? 'bg-green-50 border-green-200 opacity-60' : 'hover:bg-accent'}
                                        `}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold line-clamp-1">{q.question}</span>
                                            <div className="text-xs text-muted-foreground flex items-center">
                                                <Play className="h-3 w-3 mr-1" /> {minutes}:{seconds}
                                            </div>
                                        </div>
                                        {isCompleted ? <CheckCircle className="h-4 w-4 text-green-600" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                                    </div>
                                );
                            })}

                            {data.questions.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">Tidak ada pertanyaan timeline.</p>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* POPUP QUESTION OVERLAY */}
                {/* We use absolute positioning inside this column to act as a "modal" over the sidebar or screen */}
                <Dialog open={!!activeQuestion} onOpenChange={(open: boolean) => !open && handleResume()}>
                    <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e: any) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Pertanyaan Interaktif</DialogTitle>
                        </DialogHeader>

                        {activeQuestion && (
                            <div className="py-2">
                                <QuizRunner
                                    questions={[activeQuestion]}
                                    onComplete={handleQuestionComplete}
                                    compact={true}
                                    finishLabel="Lanjut Video"
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
