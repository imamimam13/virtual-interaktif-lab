"use client";

import VideoPlayer from "./video-player";
import QuizRunner from "./quiz-runner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface InteractiveVideoContent {
    videoUrl: string;
    questions: any[]; // Quiz data
}

interface InteractiveVideoViewerProps {
    content: string; // JSON string containing { videoUrl, questions }
    onComplete: () => void;
}

export default function InteractiveVideoViewer({ content, onComplete }: InteractiveVideoViewerProps) {
    let data: InteractiveVideoContent;

    try {
        data = JSON.parse(content);
    } catch (e) {
        return <div className="p-4 text-red-500">Error parsing interactive content.</div>;
    }

    if (!data.videoUrl) return <div className="p-4">No video URL provided.</div>;

    return (
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Video Section */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <Card className="flex-1 overflow-hidden bg-black flex items-center justify-center p-0 border-0 rounded-xl shadow-lg">
                    <div className="w-full h-full">
                        {/* We pass specific style to ensure it fits the card */}
                        <VideoPlayer content={data.videoUrl} onComplete={() => { }} />
                    </div>
                </Card>
                <div className="px-1">
                    <h3 className="font-semibold text-lg mb-1">Video Materi</h3>
                    <p className="text-sm text-muted-foreground">Tonton video ini dan kerjakan kuis di samping untuk menyelesaikan modul.</p>
                </div>
            </div>

            {/* Quiz Section */}
            <div className="lg:col-span-1 h-full">
                <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900/50">
                    <div className="p-4 border-b bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            📝 Kuis Interaktif
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        {data.questions && data.questions.length > 0 ? (
                            <QuizRunner
                                questions={data.questions}
                                onComplete={onComplete}
                                compact={true} // Hint: Add compact mode to QuizRunner if needed, or it will just be standard
                            />
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Tidak ada kuis untuk video ini.</p>
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
}
