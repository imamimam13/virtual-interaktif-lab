"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateModule } from "@/lib/module-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Code, Eye } from "lucide-react";
import Link from "next/link";

interface EditModuleFormProps {
    labId: string;
    module: any;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Perubahan
        </Button>
    );
}

export default function EditModuleForm({ labId, module }: EditModuleFormProps) {
    const updateAction = updateModule.bind(null, module.id);
    const [state, dispatch] = useActionState(updateAction, null);

    const [type, setType] = useState(module.type);
    const [title, setTitle] = useState(module.title);

    // Interactive Video State
    const [videoUrl, setVideoUrl] = useState("");
    const [quizJson, setQuizJson] = useState("[]");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [contentValue, setContentValue] = useState(module.content);
    const [previewHtml, setPreviewHtml] = useState(false);

    // Sync contentValue when interactive video fields change
    useEffect(() => {
        if (type === "INTERACTIVE_VIDEO") {
            try {
                const questions = JSON.parse(quizJson || "[]");
                if (!Array.isArray(questions)) throw new Error("Format harus berupa Array [...]");

                setContentValue(JSON.stringify({ videoUrl, questions }));
                setJsonError(null);
            } catch (e) {
                setJsonError("Format JSON tidak valid. Pastikan menggunakan format array [...] yang benar.");
            }
        }
    }, [videoUrl, quizJson, type]);

    useEffect(() => {
        if (type === "INTERACTIVE_VIDEO") {
            try {
                const parsed = JSON.parse(module.content);
                setVideoUrl(parsed.videoUrl || "");
                setQuizJson(JSON.stringify(parsed.questions || [], null, 2));
            } catch (e) {
                setVideoUrl("");
                setQuizJson("[]");
            }
        } else {
            setContentValue(module.content);
        }
    }, [type, module.content]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/labs/${labId}/modules`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Modul</h1>
                    <p className="text-muted-foreground">Perbarui konten materi untuk {module.title}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detail Modul</CardTitle>
                    <CardDescription>Ubah tipe atau konten modul praktikum ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="labId" value={labId} />

                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul Modul</Label>
                            <Input
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Praktikum Simulasi Bandul Fisika"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipe Konten</Label>
                            <Select name="type" value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HTML">🌐 HTML / Web Interactive Lab (HTML5, Canvas, SCORM)</SelectItem>
                                    <SelectItem value="INTERACTIVE_VIDEO">🎥 Interactive Video (Video + Kuis)</SelectItem>
                                    <SelectItem value="SIMULATION">🔬 PhET Simulation / Retro Emulator</SelectItem>
                                    <SelectItem value="QUIZ">📝 Kuis Interaktif</SelectItem>
                                    <SelectItem value="VIDEO">📹 Video</SelectItem>
                                    <SelectItem value="PDF">📄 Dokumen PDF</SelectItem>
                                    <SelectItem value="SCORM">📦 SCORM / HTML5 Package URL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === "HTML" ? (
                            <div className="space-y-4 border p-4 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-4 w-4 text-indigo-500" />
                                        <span className="text-sm font-semibold">Editor Kode HTML / Interaktif</span>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs"
                                        onClick={() => setPreviewHtml(!previewHtml)}
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                        {previewHtml ? "Tutup Preview" : "Live Preview"}
                                    </Button>
                                </div>

                                {previewHtml && (
                                    <div className="border rounded-lg overflow-hidden h-72 bg-white">
                                        <iframe
                                            srcDoc={contentValue}
                                            className="w-full h-full border-0"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label>Kode HTML / CSS / JavaScript atau URL</Label>
                                    <Textarea
                                        name="content"
                                        rows={12}
                                        value={contentValue}
                                        onChange={(e) => setContentValue(e.target.value)}
                                        className="font-mono text-xs"
                                        placeholder="Masukkan kode HTML lengkap atau URL package..."
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        💡 Tips: Modul HTML dapat mengirim event kelulusan ke sistem dengan kode: <code>window.parent.postMessage(&#123; type: 'LAB_COMPLETE', score: 100 &#125;, '*')</code>
                                    </p>
                                </div>
                            </div>
                        ) : type === "INTERACTIVE_VIDEO" ? (
                            <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                                <p className="text-sm font-medium">Konfigurasi Video Interaktif</p>
                                <div className="grid gap-2">
                                    <Label>URL Video</Label>
                                    <Input
                                        id="video-url"
                                        placeholder="https://youtube.com/..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Data Kuis (JSON)</Label>
                                    <Textarea
                                        id="quiz-json"
                                        placeholder='[{"question": "...", "options": [...], "answer": 0}]'
                                        className={`font-mono text-xs ${jsonError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                        rows={12}
                                        value={quizJson}
                                        onChange={(e) => setQuizJson(e.target.value)}
                                    />
                                    {jsonError && (
                                        <p className="text-xs text-red-500 font-medium">
                                            {jsonError}
                                        </p>
                                    )}
                                </div>
                                <input type="hidden" name="content" value={contentValue} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="content">
                                    {type === "VIDEO" ? "URL Video (YouTube/MP4)" :
                                        type === "PDF" ? "URL Berkas PDF" :
                                            type === "SIMULATION" ? "URL Simulasi (PhET/LabXchange)" :
                                                type === "SCORM" ? "URL SCORM Package / HTML5 Embed" :
                                                    "Data Kuis (JSON)"}
                                </Label>
                                {type === "QUIZ" ? (
                                    <Textarea
                                        name="content"
                                        id="content"
                                        placeholder='{"questions": [...]}'
                                        className="font-mono text-xs"
                                        rows={10}
                                        value={contentValue}
                                        onChange={(e) => setContentValue(e.target.value)}
                                    />
                                ) : (
                                    <Input
                                        name="content"
                                        id="content"
                                        value={contentValue}
                                        onChange={(e) => setContentValue(e.target.value)}
                                        placeholder={
                                            type === "VIDEO" ? "https://youtube.com/..." :
                                                type === "SIMULATION" ? "https://phet.colorado.edu/..." :
                                                    type === "SCORM" ? "https://example.com/scorm/index.html" :
                                                        "https://example.com/file.pdf"
                                        }
                                        required
                                    />
                                )}
                            </div>
                        )}

                        {state?.message && (
                            <p className={`text-sm ${state.message.includes("success") || state.message.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
                                {state.message}
                            </p>
                        )}

                        <div className="flex justify-end">
                            {jsonError ? (
                                <Button disabled variant="secondary">Perbaiki JSON Dulu</Button>
                            ) : (
                                <SubmitButton />
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
