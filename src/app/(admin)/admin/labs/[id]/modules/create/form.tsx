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
import { ArrowLeft, Loader2, Save, Code, Eye, Sparkles } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Modul
        </Button>
    );
}

const PRESET_GAMES = [
    { name: "Contra", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Contra%20(U)%20%5B!%5D.nes" },
    { name: "Super Mario Bros", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Super%20Mario%20Bros.%20(JU)%20%5B!%5D.nes" },
    { name: "The Legend of Zelda", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Legend%20of%20Zelda,%20The%20(U)%20(PRG1).nes" },
    { name: "Metroid", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Metroid%20(U)%20(PRG0)%20%5B!%5D.nes" },
    { name: "Tetris", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Tetris%20(U)%20%5B!%5D.nes" },
    { name: "Mega Man 2", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Mega%20Man%202%20(U)%20%5B!%5D.nes" },
];

const HTML_LAB_TEMPLATES = [
    {
        name: "Simulasi Bandul Sederhana (Fisika)",
        code: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Praktikum Bandul Sederhana</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #0f172a; color: #f8fafc; text-align: center; }
        .card { background: #1e293b; border-radius: 12px; padding: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #334155; }
        canvas { background: #020617; border-radius: 8px; margin: 15px 0; border: 1px solid #475569; }
        .controls { display: flex; flex-direction: column; gap: 10px; margin: 15px 0; text-align: left; }
        .control-row { display: flex; justify-content: space-between; align-items: center; }
        input[type=range] { width: 60%; }
        .btn { background: #10b981; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .btn:hover { background: #059669; }
        .stats { font-mono; font-size: 13px; color: #94a3b8; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="card">
        <h2>🧪 Simulasi Bandul Matematis</h2>
        <p style="font-size: 14px; color: #cbd5e1;">Amati periode ayunan dengan mengubah panjang tali dan gravitasi.</p>
        <canvas id="canvas" width="450" height="260"></canvas>
        <div class="stats" id="stats">Periode Teoritis (T): 0.00 s</div>
        <div class="controls">
            <div class="control-row">
                <label>Panjang Tali (L): <span id="lenVal">150</span> px</label>
                <input type="range" id="length" min="50" max="200" value="150">
            </div>
            <div class="control-row">
                <label>Sudut Awal (θ): <span id="angVal">45</span>°</label>
                <input type="range" id="angle" min="10" max="80" value="45">
            </div>
        </div>
        <button class="btn" onclick="selesaikanPraktikum()">✅ Laporkan & Selesaikan Praktikum</button>
    </div>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const origin = { x: canvas.width / 2, y: 30 };
        let length = 150;
        let angle = Math.PI / 4;
        let angleVelocity = 0;
        let angleAcceleration = 0;
        const gravity = 0.4;
        const damping = 0.995;

        function update() {
            angleAcceleration = (-1 * gravity / length) * Math.sin(angle);
            angleVelocity += angleAcceleration;
            angleVelocity *= damping;
            angle += angleVelocity;

            const x = origin.x + length * Math.sin(angle);
            const y = origin.y + length * Math.cos(angle);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw ceiling
            ctx.fillStyle = '#64748b';
            ctx.fillRect(origin.x - 30, origin.y - 4, 60, 4);

            // Draw string
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw bob
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#f43f5e';
            ctx.fill();
            ctx.strokeStyle = '#ffe4e6';
            ctx.lineWidth = 2;
            ctx.stroke();

            requestAnimationFrame(update);
        }

        document.getElementById('length').oninput = function(e) {
            length = Number(e.target.value);
            document.getElementById('lenVal').innerText = length;
            calcPeriod();
        };
        document.getElementById('angle').oninput = function(e) {
            angle = (Number(e.target.value) * Math.PI) / 180;
            angleVelocity = 0;
            document.getElementById('angVal').innerText = e.target.value;
        };

        function calcPeriod() {
            const T = (2 * Math.PI * Math.sqrt(length / (gravity * 100))).toFixed(2);
            document.getElementById('stats').innerText = "Periode Teoritis (T): " + T + " detik";
        }
        calcPeriod();
        update();

        function selesaikanPraktikum() {
            if (window.parent) {
                window.parent.postMessage({ type: 'LAB_COMPLETE', score: 100 }, '*');
            }
            alert('Hasil eksperimen berhasil dicatat!');
        }
    </script>
</body>
</html>`
    },
    {
        name: "Simulasi Gerbang Logika & Tabel Kebenaran (Informatika)",
        code: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Lab Gerbang Logika</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #09090b; color: #fafafa; padding: 20px; text-align: center; }
        .box { max-width: 500px; margin: 0 auto; background: #18181b; padding: 20px; border-radius: 12px; border: 1px solid #27272a; }
        .switch-row { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
        .toggle-btn { padding: 12px 24px; font-size: 16px; border-radius: 8px; border: 2px solid #3f3f46; background: #27272a; color: #fff; cursor: pointer; font-weight: bold; }
        .toggle-btn.on { background: #3b82f6; border-color: #60a5fa; box-shadow: 0 0 15px #3b82f6aa; }
        .led { width: 50px; height: 50px; border-radius: 50%; margin: 15px auto; background: #3f3f46; border: 3px solid #71717a; transition: 0.2s; }
        .led.active { background: #22c55e; border-color: #86efac; box-shadow: 0 0 25px #22c55e; }
        .submit-btn { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
    </style>
</head>
<body>
    <div class="box">
        <h3>⚡ Lab Gerbang Logika AND & OR</h3>
        <p style="font-size: 13px; color: #a1a1aa;">Nyalakan saklar input untuk menguji output lampu LED.</p>
        
        <div class="switch-row">
            <button id="swA" class="toggle-btn" onclick="toggle('A')">Input A: 0</button>
            <button id="swB" class="toggle-btn" onclick="toggle('B')">Input B: 0</button>
        </div>

        <div style="margin: 10px 0;">
            <label>Mode Gerbang: </label>
            <select id="gate" onchange="calc()" style="padding: 6px; border-radius: 6px; background: #27272a; color: white; border: 1px solid #3f3f46;">
                <option value="AND">AND GATE</option>
                <option value="OR">OR GATE</option>
                <option value="XOR">XOR GATE</option>
            </select>
        </div>

        <div id="led" class="led"></div>
        <div id="outLabel" style="font-weight: bold; margin-bottom: 20px;">Output: 0 (OFF)</div>

        <button class="submit-btn" onclick="completeLab()">Kirim Nilai Selesai</button>
    </div>

    <script>
        let inA = 0, inB = 0;
        function toggle(which) {
            if(which === 'A') { inA = inA === 0 ? 1 : 0; document.getElementById('swA').innerText = "Input A: " + inA; document.getElementById('swA').classList.toggle('on', inA === 1); }
            if(which === 'B') { inB = inB === 0 ? 1 : 0; document.getElementById('swB').innerText = "Input B: " + inB; document.getElementById('swB').classList.toggle('on', inB === 1); }
            calc();
        }
        function calc() {
            const gate = document.getElementById('gate').value;
            let res = 0;
            if (gate === 'AND') res = (inA && inB) ? 1 : 0;
            if (gate === 'OR') res = (inA || inB) ? 1 : 0;
            if (gate === 'XOR') res = (inA ^ inB) ? 1 : 0;

            const led = document.getElementById('led');
            const label = document.getElementById('outLabel');
            if (res === 1) {
                led.className = 'led active';
                label.innerText = 'Output: 1 (Lampu Menyala ON)';
                label.style.color = '#4ade80';
            } else {
                led.className = 'led';
                label.innerText = 'Output: 0 (Lampu Mati OFF)';
                label.style.color = '#f87171';
            }
        }
        function completeLab() {
            if (window.parent) {
                window.parent.postMessage({ type: 'LAB_COMPLETE', score: 100 }, '*');
            }
            alert('Praktikum selesai dengan nilai 100!');
        }
    </script>
</body>
</html>`
    }
];

export default function CreateModuleForm({ labId }: { labId: string }) {
    const [state, dispatch] = useActionState(createModule, null);
    const [type, setType] = useState("VIDEO");

    const [isEmulator, setIsEmulator] = useState(false);
    const [romUrl, setRomUrl] = useState("");
    const [romSystem, setRomSystem] = useState("nes");

    const [htmlContent, setHtmlContent] = useState(HTML_LAB_TEMPLATES[0].code);
    const [previewHtml, setPreviewHtml] = useState(false);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/labs/${labId}/modules`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Tambah Modul Baru</h1>
                    <p className="text-muted-foreground">Tambahkan materi praktikum atau modul interaktif ke lab ini.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detail Modul</CardTitle>
                    <CardDescription>Pilih jenis konten modul yang ingin dibuat.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="labId" value={labId} />

                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul Modul</Label>
                            <Input name="title" id="title" placeholder="Contoh: Praktikum Simulasi Bandul Fisika" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipe Konten</Label>
                            <Select name="type" value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HTML">🌐 HTML / Web Interactive Lab (HTML5, Canvas, SCORM)</SelectItem>
                                    <SelectItem value="INTERACTIVE_VIDEO">🎥 Interactive Video (Video + Kuis Checkpoint)</SelectItem>
                                    <SelectItem value="SIMULATION">🔬 PhET Simulation / Retro Emulator</SelectItem>
                                    <SelectItem value="QUIZ">📝 Kuis Interaktif</SelectItem>
                                    <SelectItem value="VIDEO">📹 Video Pembelajaran</SelectItem>
                                    <SelectItem value="PDF">📄 Dokumen Panduan PDF</SelectItem>
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
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(val) => {
                                            const tmpl = HTML_LAB_TEMPLATES.find(t => t.name === val);
                                            if (tmpl) setHtmlContent(tmpl.code);
                                        }}>
                                            <SelectTrigger className="h-8 text-xs w-48">
                                                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                                <SelectValue placeholder="Pilih Template Lab..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HTML_LAB_TEMPLATES.map(tmpl => (
                                                    <SelectItem key={tmpl.name} value={tmpl.name}>{tmpl.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                </div>

                                {previewHtml && (
                                    <div className="border rounded-lg overflow-hidden h-72 bg-white">
                                        <iframe
                                            srcDoc={htmlContent}
                                            className="w-full h-full border-0"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label>Kode HTML / CSS / JavaScript atau URL</Label>
                                    <Textarea
                                        name="content"
                                        id="html-content"
                                        rows={12}
                                        value={htmlContent}
                                        onChange={(e) => setHtmlContent(e.target.value)}
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
                                    <Label>URL Video (YouTube / MP4)</Label>
                                    <Input
                                        id="video-url"
                                        placeholder="https://youtube.com/..."
                                        onChange={(e) => {
                                            const videoUrl = e.target.value;
                                            const quizJson = (document.getElementById("quiz-json") as HTMLTextAreaElement)?.value || '[]';
                                            (document.getElementById("content-hidden") as HTMLInputElement).value = JSON.stringify({ videoUrl, questions: JSON.parse(quizJson || '[]') });
                                        }}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Data Kuis Checkpoint (JSON)</Label>
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
                                    {type === "VIDEO" ? "URL Video (YouTube / MP4)" :
                                        type === "PDF" ? "URL Berkas PDF" :
                                            type === "SIMULATION" ? "URL Simulasi (PhET / LabXchange)" :
                                                type === "SCORM" ? "URL SCORM Package / HTML5 Embed" :
                                                    "Data Kuis (Format JSON)"}
                                </Label>
                                {type === "QUIZ" ? (
                                    <Textarea
                                        name="content"
                                        id="content"
                                        placeholder='[{"question": "Contoh pertanyaan?", "options": ["A", "B"], "answer": 0}]'
                                        className="font-mono text-xs"
                                        rows={10}
                                        defaultValue='[{"question": "Contoh pertanyaan?", "options": ["A", "B"], "answer": 0}]'
                                    />
                                ) : (
                                    !isEmulator && (
                                        <Input
                                            name="content"
                                            id="content"
                                            placeholder={
                                                type === "VIDEO" ? "https://youtube.com/..." :
                                                    type === "SIMULATION" ? "https://phet.colorado.edu/..." :
                                                        type === "SCORM" ? "https://example.com/scorm/index.html" :
                                                            "https://example.com/file.pdf"
                                            }
                                            required={!isEmulator}
                                        />
                                    )
                                )}

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
                                            <Label htmlFor="emulator-mode" className="font-semibold cursor-pointer">Mode Retro Emulator (EmulatorJS)</Label>
                                        </div>

                                        {isEmulator && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid gap-2">
                                                    <Label>Pilih Game Preset</Label>
                                                    <Select onValueChange={(val) => {
                                                        const game = PRESET_GAMES.find(g => g.name === val);
                                                        if (game) {
                                                            setRomSystem(game.system);
                                                            setRomUrl(game.url);
                                                            const json = JSON.stringify({ type: 'EMULATOR', romUrl: game.url, system: game.system });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }
                                                    }}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih game retro..." />
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
                                                    <Label htmlFor="rom-url">URL File ROM</Label>
                                                    <Input
                                                        id="rom-url"
                                                        placeholder="https://example.com/files/contra.nes"
                                                        value={romUrl}
                                                        onChange={(e) => {
                                                            setRomUrl(e.target.value);
                                                            const json = JSON.stringify({ type: 'EMULATOR', romUrl: e.target.value, system: romSystem });
                                                            const hiddenInput = document.getElementById('content') as HTMLInputElement;
                                                            if (hiddenInput) hiddenInput.value = json;
                                                        }}
                                                    />
                                                </div>

                                                <input type="hidden" name="content" id="content" value={JSON.stringify({ type: 'EMULATOR', romUrl, system: romSystem })} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {state?.message && (
                            <p className={`text-sm ${state.message.includes("success") || state.message.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
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
