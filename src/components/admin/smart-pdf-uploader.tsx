"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { createModuleFromPdf } from "@/lib/module-actions"; // Need to create this
import { useRouter } from "next/navigation";

export default function SmartPdfUploader({ labId }: { labId: string }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file");
            return;
        }

        setIsUploading(true);
        setStatus("IDLE");

        // Simulate file upload (In real app: upload to object storage like AWS S3/Vercel Blob)
        // For demo: we will create a fake URL or data URI (not recommended for large files but ok for demo)
        // Or better: just assume it returns a URL.

        // Emulate delay
        await new Promise(r => setTimeout(r, 1500));

        // Create FormData
        const formData = new FormData();
        formData.append("title", file.name.replace(".pdf", ""));
        formData.append("type", "PDF");
        formData.append("content", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"); // Placeholder URL for demo
        formData.append("labId", labId);

        try {
            // Re-use existing createModule or make a specific one? 
            // We'll use a specialized client-side wrapper that calls the server action
            const res = await createModuleFromPdf(formData);
            if (res.message.includes("success")) {
                setStatus("SUCCESS");
                router.refresh();
                setTimeout(() => setStatus("IDLE"), 2000);
            } else {
                setStatus("ERROR");
            }
        } catch (e) {
            console.error(e);
            setStatus("ERROR");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className={`border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted"}`}>
            <CardContent
                className="flex flex-col items-center justify-center p-10 cursor-pointer"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="font-semibold text-muted-foreground">Analysing & Converting PDF...</p>
                    </div>
                ) : status === "SUCCESS" ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                        <p className="font-semibold text-green-600">Module Created Automatically!</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Upload PDF Module</h3>
                        <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to upload</p>
                        <div className="flex gap-2 justify-center">
                            <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">.PDF</span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">Auto-Format</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
