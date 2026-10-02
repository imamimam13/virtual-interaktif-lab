"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, PlayCircle, Sparkles, X, AlertCircle } from "lucide-react";
import InteractiveVideoViewer from "@/components/modules/interactive-video-viewer";
import QuizRunner from "@/components/modules/quiz-runner";
import HtmlViewer from "@/components/modules/html-viewer";
import SimulationViewer from "@/components/modules/simulation-viewer";
import VideoPlayer from "@/components/modules/video-player";
import PdfViewer from "@/components/modules/pdf-viewer";
import InstructionViewer from "@/components/modules/instruction-viewer";

interface ModulePreviewModalProps {
    type: string;
    title: string;
    // Interactive video
    videoUrl?: string;
    quizQuestions?: any[];
    // Quiz
    standaloneQuizQuestions?: any[];
    // HTML
    htmlContent?: string;
    // Instruction / Guide Text
    instructionContent?: string;
    // Generic URL (PDF, SCORM, VIDEO, SIMULATION)
    genericContent?: string;
    // Emulator
    isEmulator?: boolean;
    romUrl?: string;
    romSystem?: string;
}

export default function ModulePreviewModal({
    type,
    title,
    videoUrl = "",
    quizQuestions = [],
    standaloneQuizQuestions = [],
    htmlContent = "",
    instructionContent = "",
    genericContent = "",
    isEmulator = false,
    romUrl = "",
    romSystem = "nes",
}: ModulePreviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleComplete = (score: number = 100) => {
        setFeedback(`✅ Uji Coba Berhasil! Event kelulusan modul terpicu dengan perolehan skor: ${score}`);
    };

    const renderPreviewContent = () => {
        switch (type) {
            case "INTERACTIVE_VIDEO": {
                if (!videoUrl) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">URL Video Masih Kosong</p>
                            <p className="text-xs">Masukkan URL YouTube atau MP4 pada formulir untuk melihat live preview.</p>
                        </div>
                    );
                }
                const content = JSON.stringify({
                    videoUrl,
                    questions: quizQuestions,
                });
                return <InteractiveVideoViewer content={content} onComplete={() => handleComplete(100)} />;
            }

            case "QUIZ": {
                if (!standaloneQuizQuestions || standaloneQuizQuestions.length === 0) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">Belum Ada Soal Kuis</p>
                            <p className="text-xs">Pastikan format JSON soal sudah valid dan memiliki minimal 1 pertanyaan.</p>
                        </div>
                    );
                }
                return (
                    <div className="max-w-2xl mx-auto py-4">
                        <QuizRunner
                            questions={standaloneQuizQuestions}
                            onComplete={(score) => handleComplete(score)}
                        />
                    </div>
                );
            }

            case "HTML": {
                return (
                    <div className="h-[75vh]">
                        <HtmlViewer
                            content={htmlContent}
                            title={title || "Preview Simulasi Web HTML"}
                            onComplete={(score) => handleComplete(score)}
                        />
                    </div>
                );
            }

            case "SIMULATION": {
                const simUrl = isEmulator
                    ? JSON.stringify({ type: "EMULATOR", romUrl, system: romSystem })
                    : genericContent;

                if (!isEmulator && !genericContent) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">URL Simulasi Kosong</p>
                            <p className="text-xs">Pilih salah satu preset PhET atau masukkan link embed simulasi.</p>
                        </div>
                    );
                }
                return (
                    <div className="h-[75vh]">
                        <SimulationViewer url={simUrl} />
                    </div>
                );
            }

            case "VIDEO": {
                if (!genericContent) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">URL Video Masih Kosong</p>
                        </div>
                    );
                }
                return (
                    <div className="max-w-3xl mx-auto">
                        <VideoPlayer content={genericContent} onComplete={() => handleComplete(100)} />
                    </div>
                );
            }

            case "PDF": {
                if (!genericContent) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">URL Berkas PDF Kosong</p>
                        </div>
                    );
                }
                return (
                    <div className="h-[75vh]">
                        <PdfViewer content={genericContent} onComplete={() => handleComplete(100)} />
                    </div>
                );
            }

            case "SCORM": {
                if (!genericContent) {
                    return (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="font-semibold">URL SCORM Kosong</p>
                        </div>
                    );
                }
                return (
                    <div className="h-[75vh]">
                        <HtmlViewer
                            content={genericContent}
                            title={title || "Preview SCORM"}
                            onComplete={(score) => handleComplete(score)}
                        />
                    </div>
                );
            }

            case "INSTRUCTION": {
                return (
                    <div className="py-2">
                        <InstructionViewer
                            title={title || "Petunjuk Pelaksanaan Praktikum"}
                            content={instructionContent || genericContent || "Belum ada instruksi yang dituliskan."}
                            onComplete={(score) => handleComplete(score)}
                        />
                    </div>
                );
            }

            default:
                return <div>Tipe modul tidak dikenali.</div>;
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                onClick={() => {
                    setFeedback(null);
                    setIsOpen(true);
                }}
            >
                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-xs">🧪 Live Preview Modul</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto w-[95vw] p-6">
                    <DialogHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <span>🧪 Live Preview Mahasiswa:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{title || "Modul Praktikum"}</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Simulasi tampilan dan interaksi persis seperti yang akan dilihat & dikerjakan oleh mahasiswa.
                                </DialogDescription>
                            </div>
                            <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                                {type}
                            </span>
                        </div>
                    </DialogHeader>

                    {feedback && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center justify-between">
                            <span>{feedback}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setFeedback(null)}>
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    <div className="py-2 min-h-[400px]">
                        {renderPreviewContent()}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
