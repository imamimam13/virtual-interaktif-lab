"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Info, Sparkles, CheckCheck } from "lucide-react";

interface InstructionViewerProps {
    title?: string;
    content: string;
    onComplete?: (score?: number) => void;
}

export default function InstructionViewer({ title, content, onComplete }: InstructionViewerProps) {
    const [isCompleted, setIsCompleted] = useState(false);

    const handleAcknowledge = () => {
        setIsCompleted(true);
        if (onComplete) {
            onComplete(100);
        }
    };

    // Helper to format simple markdown-like text to formatted HTML safely
    const formatInstruction = (text: string) => {
        // If content already contains HTML tags like <div, <p, <h, render as HTML
        const hasHtmlTags = /<[a-z][\s\S]*>/i.test(text);

        if (hasHtmlTags) {
            return (
                <div
                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base space-y-4"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }

        // Simple markdown line renderer
        const paragraphs = text.split("\n\n");
        return (
            <div className="space-y-4 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                {paragraphs.map((para, idx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;

                    // Heading 1
                    if (trimmed.startsWith("# ")) {
                        return <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-2 border-b pb-2">{trimmed.slice(2)}</h2>;
                    }
                    // Heading 2
                    if (trimmed.startsWith("## ")) {
                        return <h3 key={idx} className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300 pt-2">{trimmed.slice(3)}</h3>;
                    }
                    // Heading 3
                    if (trimmed.startsWith("### ")) {
                        return <h4 key={idx} className="text-base font-semibold text-slate-900 dark:text-slate-100">{trimmed.slice(4)}</h4>;
                    }
                    // Blockquote / Tip
                    if (trimmed.startsWith("> ")) {
                        return (
                            <div key={idx} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500 text-blue-900 dark:text-blue-200 text-sm flex gap-3 items-start">
                                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>{trimmed.slice(2)}</div>
                            </div>
                        );
                    }
                    // List
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        const items = trimmed.split("\n").map(l => l.replace(/^[-*]\s*/, ""));
                        return (
                            <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                                {items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        );
                    }
                    // Numbered List
                    if (/^\d+\.\s/.test(trimmed)) {
                        const items = trimmed.split("\n").map(l => l.replace(/^\d+\.\s*/, ""));
                        return (
                            <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                                {items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ol>
                        );
                    }

                    return <p key={idx} className="whitespace-pre-line">{trimmed}</p>;
                })}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Card className="border shadow-md bg-white dark:bg-zinc-950">
                <CardHeader className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-zinc-900 border-b pb-6">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <BookOpen className="h-4 w-4" /> Panduan & Instruksi Modul
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">
                        {title || "Petunjuk Pelaksanaan Praktikum"}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Bacalah instruksi dan petunjuk kerja di bawah ini secara seksama sebelum memulai aktivitas berikutnya.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-8">
                    <div className="bg-slate-50/50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        {formatInstruction(content || "Belum ada instruksi yang dituliskan.")}
                    </div>

                    <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {isCompleted ? (
                                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                                    <CheckCheck className="h-4 w-4" /> Instruksi telah dipelajari & dicatat selesai.
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Info className="h-4 w-4 text-blue-500" /> Klik tombol di samping untuk menandai bahwa Anda telah membaca panduan ini.
                                </span>
                            )}
                        </div>

                        <Button
                            onClick={handleAcknowledge}
                            disabled={isCompleted}
                            className={`w-full sm:w-auto font-semibold gap-2 transition-all ${
                                isCompleted
                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle className="h-4 w-4" /> Sudah Dipelajari
                                </>
                            ) : (
                                <>
                                    <span>Saya Paham, Selesaikan Instruksi</span>
                                    <CheckCircle className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
