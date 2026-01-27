"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createModule } from "@/lib/module-actions";
import { uploadRom } from "@/lib/upload-actions";
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

const PRESET_GAMES = [
    // NES
    { name: "Contra", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Contra%20(U)%20%5B!%5D.nes" },
    { name: "Super Mario Bros", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Super%20Mario%20Bros.%20(JU)%20%5B!%5D.nes" },
    { name: "Super Mario Bros 3", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Super%20Mario%20Bros.%203%20(U)%20(PRG1)%20%5B!%5D.nes" },
    { name: "The Legend of Zelda", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Legend%20of%20Zelda,%20The%20(U)%20(PRG1).nes" },
    { name: "Metroid", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Metroid%20(U)%20(PRG0)%20%5B!%5D.nes" },
    { name: "Castlevania", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Castlevania%20(U)%20(PRG1)%20%5B!%5D.nes" },
    { name: "Tetris", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Tetris%20(U)%20%5B!%5D.nes" },
    { name: "Mega Man 2", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Mega%20Man%202%20(U)%20%5B!%5D.nes" },
    { name: "Pac-Man", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Pac-Man%20(USA)%20(Namco).nes" },
    { name: "Donkey Kong", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Donkey%20Kong%20(JU).nes" },
    { name: "Punch-Out!!", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Punch-Out!!%20(U)%20%5B!%5D.nes" },
    { name: "Final Fantasy", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Final%20Fantasy%20(U)%20%5B!%5D.nes" },

    // GBA (Homebrew/Demos for legality/safety example)
    { name: "Anguna (Homebrew RPG)", system: "gba", url: "https://raw.githubusercontent.com/retrobrews/gba-games/master/homebrews/Anguna/Anguna.gba" },

    // Sega Genesis
    { name: "Sonic The Hedgehog", system: "sega", url: "https://raw.githubusercontent.com/retrobrews/genesis-games/master/public-domain/Sonic%20the%20Hedgehog%20(USA).md" },
];

export default function CreateModuleForm({ labId }: { labId: string }) {
    const [state, dispatch] = useActionState(createModule, null);
    const [type, setType] = useState("VIDEO");

    const [isEmulator, setIsEmulator] = useState(false);
    const [romUrl, setRomUrl] = useState("");
    const [romSystem, setRomSystem] = useState("nes");

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
                                    !isEmulator && (
                                        <Input
                                            name="content"
                                            id="content"
                                            placeholder={
                                                type === "VIDEO" ? "https://youtube.com/..." :
                                                    type === "SIMULATION" ? "https://phet.colorado.edu/..." :
                                                        "https://example.com/file.pdf"
                                            }
                                            required={!isEmulator}
                                        />
                                    )
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {type === "QUIZ" ? "Enter quiz questions in JSON format." :
                                        type === "SIMULATION" ? "Direct URL to PhET or LabXchange HTML5 simulation." :
                                            "Provide the direct URL to the resource."}
                                </p>

                                {type === "SIMULATION" && (
                                    <div className="mt-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="emulator-mode"
                                                className="h-4 w-4"
                                                checked={isEmulator}
                                                onChange={(e) => setIsEmulator(e.target.checked)}
                                            />
                                            <Label htmlFor="emulator-mode" className="font-semibold cursor-pointer">Enable Emulator Mode (Retro Games)</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Play retro games directly in the browser using EmulatorJS.
                                        </p>

                                        {isEmulator && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid gap-2">
                                                    <Label>Quick Select Game (Optional)</Label>
                                                    <Select onValueChange={(val) => {
                                                        const game = PRESET_GAMES.find(g => g.name === val);
                                                        if (game) {
                                                            setRomSystem(game.system);
                                                            setRomUrl(game.url);
                                                            // Update hidden content
                                                            const json = JSON.stringify({ type: 'EMULATOR', romUrl: game.url, system: game.system });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }
                                                    }}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a popular game..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PRESET_GAMES.map(game => (
                                                                <SelectItem key={game.name} value={game.name}>
                                                                    {game.name} ({game.system.toUpperCase()})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="rom-system">Console System</Label>
                                                    <Select value={romSystem} onValueChange={(val) => {
                                                        setRomSystem(val);
                                                        // Update hidden content
                                                        const json = JSON.stringify({ type: 'EMULATOR', romUrl, system: val });
                                                        const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                        if (hiddenInput) hiddenInput.value = json;
                                                    }}>
                                                        <SelectTrigger id="rom-system">
                                                            <SelectValue placeholder="Select System" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="nes">Nintendo (NES)</SelectItem>
                                                            <SelectItem value="snes">Super Nintendo (SNES)</SelectItem>
                                                            <SelectItem value="gba">GameBoy Advance (GBA)</SelectItem>
                                                            <SelectItem value="sega">Sega Genesis (MegaDrive)</SelectItem>
                                                            <SelectItem value="psx">PlayStation 1 (PSX)</SelectItem>
                                                            <SelectItem value="n64">Nintendo 64</SelectItem>
                                                            <SelectItem value="nds">Nintendo DS</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="rom-url">ROM URL (Direct Link)</Label>
                                                    <Input
                                                        id="rom-url"
                                                        placeholder="https://example.com/files/contra.nes"
                                                        value={romUrl}
                                                        onChange={(e) => {
                                                            setRomUrl(e.target.value);
                                                            // Update hidden content
                                                            const json = JSON.stringify({ type: 'EMULATOR', romUrl: e.target.value, system: romSystem });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter a direct link to a ROM file (.nes, .smc, .gba, etc).
                                                        You can find public domain ROMs on GitHub or Archive.org.
                                                    </p>
                                                </div>

                                                <div className="grid gap-2 border-t pt-2 mt-2">
                                                    <Label>Or Upload Local ROM (Recommended)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="file"
                                                            className="text-xs"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;

                                                                const formData = new FormData();
                                                                formData.append("file", file);

                                                                // Show loading via toast or button text if possible, but for now simple alert
                                                                const target = e.target as HTMLInputElement;
                                                                target.disabled = true;

                                                                const res = await uploadRom(formData);
                                                                if (res.success && res.url) {
                                                                    setRomUrl(res.url); // Use relative path
                                                                    // Update hidden content
                                                                    const json = JSON.stringify({ type: 'EMULATOR', romUrl: res.url, system: romSystem });
                                                                    const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                                    if (hiddenInput) hiddenInput.value = json;
                                                                    alert("Upload Success!");
                                                                } else {
                                                                    alert("Upload Failed: " + res.message);
                                                                }
                                                                target.disabled = false;
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload .nes, .snes, .gba, .zip files directly to your server.
                                                        Fixes "Network Error" issues.
                                                    </p>
                                                </div>

                                                {/* Hidden input override */}
                                                <input type="hidden" name="content" id="content" value={JSON.stringify({ type: 'EMULATOR', romUrl, system: romSystem })} />
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
