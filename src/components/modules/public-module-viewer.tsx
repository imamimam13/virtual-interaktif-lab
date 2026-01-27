"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import VideoPlayer from "./video-player";
import PdfViewer from "./pdf-viewer";
import QuizRunner from "./quiz-runner";
import SimulationViewer from "./simulation-viewer";
import InteractiveVideoViewer from "./interactive-video-viewer";

interface Module {
    id: string;
    title: string;
    type: "VIDEO" | "PDF" | "QUIZ" | "SIMULATION" | "INTERACTIVE_VIDEO";
    content: string; // JSON string
    completed: boolean;
}

interface ModuleViewerProps {
    currentModule: Module;
    allModules: Module[];
    labId: string;
}

export default function PublicModuleViewer({ currentModule, allModules, labId }: ModuleViewerProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Find prev/next
    const currentIndex = allModules.findIndex(m => m.id === currentModule.id);
    const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
    const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

    // No-op for public
    // const handleComplete = async (score: number = 0) => {};

    const renderContent = () => {
        switch (currentModule.type) {
            case "VIDEO":
                return <VideoPlayer content={currentModule.content} onComplete={() => { }} />;
            case "PDF":
                return <PdfViewer content={currentModule.content} onComplete={() => { }} />;
            case "QUIZ":
                // Parse quiz content safely
                let quizData = [];
                try {
                    quizData = JSON.parse(currentModule.content);
                } catch (e) {
                    console.error("Invalid Quiz JSON", e);
                }
                return <QuizRunner questions={quizData} onComplete={() => { }} />;
            case "SIMULATION":
                return <SimulationViewer url={currentModule.content} />;
            case "INTERACTIVE_VIDEO":
                return <InteractiveVideoViewer content={currentModule.content} onComplete={() => { }} />;
            default:
                return <div>Unsupported Module Type</div>;
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row bg-gray-50 dark:bg-zinc-900">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-80 border-r bg-white dark:bg-zinc-950 md:flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Daftar Modul (Demo)</h3>
                    <Link href={`/demo/labs/${labId}`}>
                        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {allModules.map((m, idx) => (
                        <Link key={m.id} href={`/demo/module/${m.id}`}>
                            <div className={cn(
                                "p-3 rounded-lg text-sm flex items-center gap-3 transition-colors",
                                m.id === currentModule.id
                                    ? "bg-green-100 text-green-700 font-medium border border-green-200"
                                    : "hover:bg-accent text-muted-foreground"
                            )}>
                                <div className="h-4 w-4 rounded-full border-2 border-muted flex flex-col items-center justify-center text-[10px]">
                                    {idx + 1}
                                </div>
                                <span className="line-clamp-1">{m.title}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Mobile Header / Sidebar Trigger */}
            <div className="md:hidden p-4 bg-white dark:bg-zinc-950 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className="py-4">
                                <h3 className="font-semibold mb-4">Daftar Modul</h3>
                                <div className="space-y-2">
                                    {allModules.map((m, idx) => (
                                        <Link key={m.id} href={`/demo/module/${m.id}`} onClick={() => setIsSidebarOpen(false)}>
                                            <div className={cn(
                                                "p-3 rounded-lg text-sm flex items-center gap-3",
                                                m.id === currentModule.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
                                            )}>
                                                <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span>
                                                <span className="line-clamp-1">{m.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold truncate max-w-[200px]">{currentModule.title}</span>
                </div>
                <Link href={`/demo/labs/${labId}`}>
                    <Button variant="ghost" size="sm">Exit</Button>
                </Link>
            </div>

            {/* Main Player Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
                <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
                    {renderContent()}
                </div>

                {/* Navigation Footer */}
                <div className="mt-8 pt-4 border-t flex justify-between max-w-5xl mx-auto w-full">
                    {prevModule ? (
                        <Link href={`/demo/module/${prevModule.id}`}>
                            <Button variant="outline">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextModule ? (
                        <Link href={`/demo/module/${nextModule.id}`}>
                            <Button>
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`/demo/labs/${labId}`}>
                            <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                                Selesai Demo
                            </Button>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
