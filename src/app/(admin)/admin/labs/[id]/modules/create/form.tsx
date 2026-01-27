"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createModule } from "@/lib/module-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Module
        </Button>
    );
}

export default function CreateModuleForm({ labId }: { labId: string }) {
    const [state, dispatch] = useActionState(createModule, null);
    const [type, setType] = useState("VIDEO");
    const [isGameExtractor, setIsGameExtractor] = useState(false);
    const [cssSelector, setCssSelector] = useState("");
    const [simUrl, setSimUrl] = useState("");

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/labs/${labId}/modules`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Add New Module</h1>
                    <p className="text-muted-foreground">Add learning material to this lab.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Module Details</CardTitle>
                    <CardDescription>Choose the type of content you want to add.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="labId" value={labId} />

                        <div className="grid gap-2">
                            <Label htmlFor="title">Module Title</Label>
                            <Input name="title" id="title" placeholder="e.g., Introduction to Accounting" required />
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
                                        onChange={(e) => {
                                            // Manual simple construction of the JSON
                                            const videoUrl = e.target.value;
                                            const quizJson = (document.getElementById("quiz-json") as HTMLTextAreaElement)?.value || '[]';
                                            (document.getElementById("content-hidden") as HTMLInputElement).value = JSON.stringify({ videoUrl, questions: JSON.parse(quizJson || '[]') });
                                        }}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quiz Data (JSON)</Label>
                                    <Textarea
                                        id="quiz-json"
                                        placeholder='[{"question": "...", "options": [...], "answer": 0}]'
                                        className="font-mono text-xs"
                                        rows={8}
                                        defaultValue='[]'
                                        onChange={(e) => {
                                            const quizJson = e.target.value;
                                            const videoUrl = (document.getElementById("video-url") as HTMLInputElement)?.value || '';
                                            try {
                                                const parsed = JSON.parse(quizJson);
                                                (document.getElementById("content-hidden") as HTMLInputElement).value = JSON.stringify({ videoUrl, questions: parsed });
                                            } catch (e) { }
                                        }}
                                    />
                                </div>
                                <input type="hidden" name="content" id="content-hidden" />
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
                                        defaultValue='[{"question": "Example?", "options": ["A", "B"], "answer": 0}]'
                                    />
                                ) : (
                                    !isGameExtractor && (
                                        <Input
                                            name="content"
                                            id="content"
                                            placeholder={
                                                type === "VIDEO" ? "https://youtube.com/..." :
                                                    type === "SIMULATION" ? "https://phet.colorado.edu/..." :
                                                        "https://example.com/file.pdf"
                                            }
                                            required={!isGameExtractor}
                                        />
                                    )
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {type === "QUIZ" ? "Enter quiz questions in JSON format." :
                                        type === "SIMULATION" ? "Direct URL to PhET or LabXchange HTML5 simulation." :
                                            "Provide the direct URL to the resource."}
                                </p>

                                {type === "SIMULATION" && (
                                    <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="game-extractor"
                                                className="h-4 w-4"
                                                checked={isGameExtractor}
                                                onChange={(e) => setIsGameExtractor(e.target.checked)}
                                            />
                                            <Label htmlFor="game-extractor" className="font-semibold cursor-pointer">Enable Game Extractor (Proxy)</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Use this if you want to embed a game from a website (e.g. classicgamezone) and hide surrounding elements (ads, header, etc).
                                        </p>

                                        {isGameExtractor && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="sim-url">Game Page URL</Label>
                                                    <Input
                                                        id="sim-url"
                                                        placeholder="https://example.com/games/contra"
                                                        value={simUrl}
                                                        onChange={(e) => {
                                                            setSimUrl(e.target.value);
                                                            // update hidden content
                                                            const json = JSON.stringify({ type: 'PROXY', url: e.target.value, selector: cssSelector });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="css-selector">CSS Selector (Element to Keep)</Label>
                                                    <Input
                                                        id="css-selector"
                                                        placeholder="#game-container or canvas"
                                                        value={cssSelector}
                                                        onChange={(e) => {
                                                            setCssSelector(e.target.value);
                                                            // update hidden content
                                                            const json = JSON.stringify({ type: 'PROXY', url: simUrl, selector: e.target.value });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground">Everything NOT matching this selector will be hidden.</p>
                                                </div>
                                                {/* Override the main content input */}
                                                <input type="hidden" name="content" id="content" value={JSON.stringify({ type: 'PROXY', url: simUrl, selector: cssSelector })} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {state?.message && (
                            <p className={`text-sm ${state.message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                                {state.message}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
