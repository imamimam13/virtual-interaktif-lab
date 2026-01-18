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
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
            Save Changes
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

    // Sync contentValue when interactive video fields change
    useEffect(() => {
        if (type === "INTERACTIVE_VIDEO") {
            try {
                // Try to parse quizJson to ensure it's valid before saving
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
        }
    }, [type, module.content]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/labs/${labId}/modules`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Module</h1>
                    <p className="text-muted-foreground">Update content for {module.title}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Module Details</CardTitle>
                    <CardDescription>Update the type or content of this module.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="labId" value={labId} />

                        <div className="grid gap-2">
                            <Label htmlFor="title">Module Title</Label>
                            <Input
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Introduction to Accounting"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Content Type</Label>
                            <Select name="type" value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                    <SelectItem value="PDF">PDF Document</SelectItem>
                                    <SelectItem value="QUIZ">Interactive Quiz</SelectItem>
                                    <SelectItem value="SIMULATION">Simulation (HTML5/PhET)</SelectItem>
                                    <SelectItem value="INTERACTIVE_VIDEO">Interactive Video (Video + Quiz)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === "INTERACTIVE_VIDEO" ? (
                            <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                                <p className="text-sm font-medium">Interactive Video Configuration</p>
                                <div className="grid gap-2">
                                    <Label>Video URL</Label>
                                    <Input
                                        id="video-url"
                                        placeholder="https://youtube.com/..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quiz Data (JSON)</Label>
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
                                    <p className="text-xs text-muted-foreground">
                                        Pastikan semua pertanyaan ada dalam <b>satu blok array <code>[...]</code></b>. Gunakan koma <code>,</code> antar objek pertanyaan.
                                    </p>
                                </div>
                                <input type="hidden" name="content" value={contentValue} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="content">
                                    {type === "VIDEO" ? "Video URL (YouTube/MP4)" :
                                        type === "PDF" ? "PDF URL" :
                                            type === "SIMULATION" ? "Simulation URL (PhET/LabXchange)" :
                                                "Quiz Data (JSON)"}
                                </Label>
                                {type === "QUIZ" ? (
                                    <Textarea
                                        name="content"
                                        id="content"
                                        placeholder='{"questions": [...]}'
                                        className="font-mono text-xs"
                                        rows={10}
                                        defaultValue={module.content}
                                    />
                                ) : (
                                    <Input
                                        name="content"
                                        id="content"
                                        placeholder={
                                            type === "VIDEO" ? "https://youtube.com/..." :
                                                type === "SIMULATION" ? "https://phet.colorado.edu/..." :
                                                    "https://example.com/file.pdf"
                                        }
                                        defaultValue={module.content}
                                        required
                                    />
                                )}
                            </div>
                        )}

                        {state?.message && (
                            <p className={`text-sm ${state.message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                                {state.message}
                            </p>
                        )}

                        <div className="flex justify-end">
                            {/* Pass error state to disable button logic if we moved button inside, 
                                but since SubmitButton is separate function, we might need to pass prop or just hide it? 
                                Simplified: Just wrap button in conditional or pass prop to SubmitButton if easy. 
                                Or simply don't render it if error? */}
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
