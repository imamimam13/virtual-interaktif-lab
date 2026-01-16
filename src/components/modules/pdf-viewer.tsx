"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import { useState } from "react";

interface PdfViewerProps {
    content: string;
    onComplete: () => void;
}

export default function PdfViewer({ content, onComplete }: PdfViewerProps) {
    const [isCompleted, setIsCompleted] = useState(false);

    return (
        <div className="flex flex-col gap-6 h-full min-h-[600px]">
            <div className="flex-1 w-full bg-white rounded-xl overflow-hidden shadow-lg border">
                <object data={content} type="application/pdf" className="w-full h-full min-h-[600px]">
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                        <p className="text-muted-foreground">Browser anda tidak mendukung preview PDF.</p>
                        <a href={content} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </Button>
                        </a>
                    </div>
                </object>
            </div>

            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={() => { setIsCompleted(true); onComplete(); }}
                    className={`${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle className="mr-2 h-5 w-5" /> Selesai Dibaca
                        </>
                    ) : (
                        "Tandai Selesai"
                    )}
                </Button>
            </div>
        </div>
    );
}
