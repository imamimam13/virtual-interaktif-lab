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
import { ArrowLeft, Loader2, Save, Code, Eye, Sparkles, HelpCircle, CheckCircle2, AlertCircle, FileText, Video, Layers, ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";
import ModulePreviewModal from "@/components/admin/module-preview-modal";

interface EditModuleFormProps {
    labId: string;
    module: any;
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending || disabled}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Perubahan
        </Button>
    );
}

const INSTRUCTION_TEMPLATES = [
    {
        name: "Panduan Langkah Kerja Praktikum Standar",
        content: `# 📋 Petunjuk Pelaksanaan Praktikum

## 🎯 Tujuan Pembelajaran
Setelah menyelesaikan modul praktikum ini, mahasiswa diharapkan mampu:
1. Memahami konsep dasar dan alur kerja sistem secara menyeluruh.
2. Mengidentifikasi variabel kunci dan parameter pengukuran dalam eksperimen.
3. Menganalisis data hasil pengujian dan menyusun kesimpulan praktikum secara mandiri.

---

## 🛠️ Alat, Bahan & Perangkat yang Digunakan
- Komputer / Laptop dengan peramban (browser) modern.
- Modul Simulasi Laboratorium Interaktif.
- Lembar Kerja Praktikum (LKP) & Kalkulator Ilmiah.

---

## 📝 Langkah-Langkah Pengerjaan
1. **Pelajari Materi Awal**: Tonton video pengantar dan baca lembar referensi yang disediakan pada modul sebelumnya.
2. **Jalankan Simulasi**: Atur variabel input sesuai dengan tabel penugasan pada lembar praktikum.
3. **Catat Hasil Pengamatan**: Amati perubahan nilai output dan catat pada lembar kerja Anda.
4. **Kerjakan Evaluasi**: Jawab seluruh pertanyaan kuis checkpoint untuk menguji pemahaman Anda.

> 💡 **Catatan Penting**: Pastikan Anda menekan tombol **"Saya Paham, Selesaikan Instruksi"** di bagian bawah halaman setelah selesai membaca agar progres belajar Anda tersimpan ke sistem SIAKAD.`
    },
    {
        name: "Tata Tertib & SOP Laboratorium Virtual",
        content: `# 📜 Tata Tertib & Standar Operasional Prosedur (SOP) Lab

## ⚖️ Peraturan Umum
1. **Kehadiran & Akses**: Mahasiswa wajib mengakses modul laboratorium virtual sesuai dengan jadwal perkuliahan yang telah ditentukan di SIAKAD.
2. **Integritas Akademik**: Seluruh tugas, kuis, dan simulasi wajib dikerjakan secara mandiri. Segala bentuk kecurangan akan berakibat pembatalan nilai praktikum.
3. **Koneksi Jaringan**: Pastikan koneksi internet stabil saat menjalankan modul simulasi dan kuis real-time.

---

## 🚨 Prosedur Jika Terjadi Kendala Teknis
- Jika simulasi tidak merespons, lakukan *refresh* halaman browser (tekan \`Ctrl + F5\` atau \`Cmd + Shift + R\`).
- Jika nilai tidak otomatis tersinkronisasi ke SIAKAD setelah menyelesaikan kuis, hubungi asisten laboratorium atau dosen pengampu dengan melampirkan tangkapan layar (*screenshot*) bukti pengerjaan.

> ⚠️ **Perhatian**: Jangan menutup browser saat sedang mengerjakan kuis berwaktu (*timed quiz*) sebelum menekan tombol submit jawaban.`
    },
    {
        name: "Petunjuk Pengerjaan Evaluasi & Kuis Akhir",
        content: `# ✍️ Petunjuk Pengerjaan Kuis & Uji Kompetensi

## 📌 Ketentuan Kuis
- **Jumlah Soal**: Terdiri dari soal pilihan ganda interaktif.
- **Waktu Pengerjaan**: Setiap pertanyaan memiliki batas waktu tertentu.
- **Passing Grade**: Nilai kelulusan minimum adalah **70**.
- **Bobot Nilai**: Nilai kuis ini akan otomatis dikirimkan ke modul penilaian nilai akhir semester di SIAKAD.

---

## 💡 Tips Pengerjaan
- Bacalah setiap soal dan pilihan jawaban dengan teliti sebelum memilih.
- Manfaatkan waktu yang tersedia sebaik mungkin, jangan terburu-buru.
- Setelah selesai, periksa kembali rangkuman skor Anda di dashboard praktikum.`
    }
];

const PRESET_GAMES = [
    { name: "Contra", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Contra%20(U)%20%5B!%5D.nes" },
    { name: "Super Mario Bros", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Super%20Mario%20Bros.%20(JU)%20%5B!%5D.nes" },
    { name: "The Legend of Zelda", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Legend%20of%20Zelda,%20The%20(U)%20(PRG1).nes" },
    { name: "Metroid", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Metroid%20(U)%20(PRG0)%20%5B!%5D.nes" },
    { name: "Tetris", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Tetris%20(U)%20%5B!%5D.nes" },
    { name: "Mega Man 2", system: "nes", url: "https://raw.githubusercontent.com/gregfreeman/nes-roms/master/Mega%20Man%202%20(U)%20%5B!%5D.nes" },
];

const PHET_PRESETS = [
    { name: "Sirkuit Listrik DC (Circuit Construction Kit)", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html" },
    { name: "Hukum Ohm (Ohm's Law)", url: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html" },
    { name: "Gelombang Tali (Wave on a String)", url: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html" },
    { name: "Skala pH Larutan (pH Scale)", url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html" },
    { name: "Hukum Faraday & Induksi Elektromagnetik", url: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html" },
];

const QUIZ_DEFAULT_TEMPLATE = [
    {
        question: "Apa tujuan utama dari proses kalibrasi pada alat ukur laboratorium?",
        options: [
            "Menyesuaikan hasil pengukuran agar sesuai dengan nilai standar/acuan",
            "Membuat alat ukur bekerja lebih cepat dari biasanya",
            "Mengubah satuan ukur dari metrik ke imperial",
            "Mengurangi daya listrik yang dikonsumsi alat"
        ],
        answer: 0,
        explanation: "Kalibrasi bertujuan memastikan akurasi dan ketertelusuran instrumen ukur ke standar acuan."
    },
    {
        question: "Hukum Ohm menyatakan hubungan antara beda potensial (V), arus listrik (I), dan hambatan (R) sebagai:",
        options: [
            "V = I / R",
            "V = I * R",
            "V = I + R",
            "V = R / I"
        ],
        answer: 1,
        explanation: "Menurut Hukum Ohm, beda potensial (V) berbanding lurus dengan arus (I) dan hambatan (R), yaitu V = I * R."
    },
    {
        question: "Manakah di bawah ini yang merupakan besaran pokok dalam Sistem Internasional (SI)?",
        options: [
            "Kecepatan (m/s)",
            "Gaya (Newton)",
            "Kuat Arus Listrik (Ampere)",
            "Tekanan (Pascal)"
        ],
        answer: 2,
        explanation: "Kuat arus listrik (Ampere) adalah salah satu dari 7 besaran pokok SI."
    }
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

export default function EditModuleForm({ labId, module }: EditModuleFormProps) {
    const updateAction = updateModule.bind(null, module.id);
    const [state, dispatch] = useActionState(updateAction, null);

    const [type, setType] = useState(module.type);
    const [title, setTitle] = useState(module.title);

    // Standard content URL state
    const [genericContent, setGenericContent] = useState(module.content);

    // Simulation / Emulator State
    const [isEmulator, setIsEmulator] = useState(false);
    const [romUrl, setRomUrl] = useState("");
    const [romSystem, setRomSystem] = useState("nes");

    // HTML Lab State
    const [htmlContent, setHtmlContent] = useState(module.type === "HTML" ? module.content : HTML_LAB_TEMPLATES[0].code);
    const [previewHtml, setPreviewHtml] = useState(false);

    // Instruction / Panduan State
    const [instructionContent, setInstructionContent] = useState(module.type === "INSTRUCTION" ? module.content : INSTRUCTION_TEMPLATES[0].content);

    // Interactive Video States
    const [videoUrl, setVideoUrl] = useState("");
    const [quizJson, setQuizJson] = useState("[]");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);

    // Standalone Quiz States
    const [standaloneQuizJson, setStandaloneQuizJson] = useState("[]");
    const [standaloneQuizError, setStandaloneQuizError] = useState<string | null>(null);
    const [standaloneParsedList, setStandaloneParsedList] = useState<any[]>([]);

    // Initialize content based on module data
    useEffect(() => {
        if (module.type === "INTERACTIVE_VIDEO") {
            try {
                const parsed = JSON.parse(module.content);
                setVideoUrl(parsed.videoUrl || "");
                setQuizJson(JSON.stringify(parsed.questions || [], null, 2));
            } catch (e) {
                setVideoUrl("");
                setQuizJson("[]");
            }
        } else if (module.type === "QUIZ") {
            try {
                const parsed = JSON.parse(module.content);
                setStandaloneQuizJson(JSON.stringify(parsed || [], null, 2));
                setStandaloneParsedList(parsed || []);
            } catch (e) {
                setStandaloneQuizJson(module.content || "[]");
            }
        } else if (module.type === "SIMULATION") {
            try {
                const parsed = JSON.parse(module.content);
                if (parsed.type === "EMULATOR") {
                    setIsEmulator(true);
                    setRomUrl(parsed.romUrl || "");
                    setRomSystem(parsed.system || "nes");
                } else {
                    setGenericContent(module.content);
                }
            } catch (e) {
                setGenericContent(module.content);
            }
        } else if (module.type === "HTML") {
            setHtmlContent(module.content);
        } else if (module.type === "INSTRUCTION") {
            setInstructionContent(module.content);
        } else {
            setGenericContent(module.content);
        }
    }, [module]);

    // Sync Interactive Video validation
    useEffect(() => {
        if (type === "INTERACTIVE_VIDEO") {
            try {
                const questions = JSON.parse(quizJson || "[]");
                if (!Array.isArray(questions)) {
                    setJsonError("Format harus berupa Array JSON [...]");
                    setParsedQuestions([]);
                } else {
                    setJsonError(null);
                    setParsedQuestions(questions);
                }
            } catch (e: any) {
                setJsonError("Format JSON tidak valid. Pastikan format array [...] yang benar.");
                setParsedQuestions([]);
            }
        }
    }, [videoUrl, quizJson, type]);

    // Sync Standalone Quiz validation
    useEffect(() => {
        if (type === "QUIZ") {
            try {
                const questions = JSON.parse(standaloneQuizJson || "[]");
                if (!Array.isArray(questions)) {
                    setStandaloneQuizError("Format harus berupa Array JSON [...]");
                    setStandaloneParsedList([]);
                } else {
                    setStandaloneQuizError(null);
                    setStandaloneParsedList(questions);
                }
            } catch (e: any) {
                setStandaloneQuizError("Format JSON tidak valid");
                setStandaloneParsedList([]);
            }
        }
    }, [standaloneQuizJson, type]);

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
                    <p className="text-muted-foreground">Perbarui konten dan konfigurasi materi untuk <b>{module.title}</b></p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Detail Modul</CardTitle>
                        <CardDescription>Ubah tipe atau konten modul praktikum ini.</CardDescription>
                    </div>
                    <ModulePreviewModal
                        type={type}
                        title={title}
                        videoUrl={videoUrl}
                        quizQuestions={parsedQuestions}
                        standaloneQuizQuestions={standaloneParsedList}
                        htmlContent={htmlContent}
                        instructionContent={instructionContent}
                        genericContent={genericContent}
                        isEmulator={isEmulator}
                        romUrl={romUrl}
                        romSystem={romSystem}
                    />
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="labId" value={labId} />

                        <div className="grid gap-2">
                            <Label htmlFor="title" className="font-semibold">Judul Modul</Label>
                            <Input
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Praktikum 01 - Simulasi Sirkuit Listrik"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type" className="font-semibold">Tipe Modul Praktikum</Label>
                            <Select name="type" value={type} onValueChange={setType}>
                                <SelectTrigger className="font-medium">
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INSTRUCTION">📖 Lembar Instruksi / Panduan Praktikum (Teks / Markdown)</SelectItem>
                                    <SelectItem value="HTML">🌐 HTML / Web Interactive Lab (HTML5, Canvas, Tulis Kode Sendiri)</SelectItem>
                                    <SelectItem value="INTERACTIVE_VIDEO">🎥 Interactive Video (Video + Kuis Pop-up Checkpoint)</SelectItem>
                                    <SelectItem value="QUIZ">📝 Kuis Interaktif (Pilihan Ganda Auto-Grading)</SelectItem>
                                    <SelectItem value="SIMULATION">🔬 Simulasi Virtual Lab (PhET / Retro Emulator)</SelectItem>
                                    <SelectItem value="VIDEO">📹 Video Pembelajaran Mandiri (YouTube / MP4)</SelectItem>
                                    <SelectItem value="PDF">📄 Dokumen Panduan / Modul PDF</SelectItem>
                                    <SelectItem value="SCORM">📦 SCORM / HTML5 E-Learning Package URL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ==================== 0. TIPE: INSTRUCTION ==================== */}
                        {type === "INSTRUCTION" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-gradient-to-b from-blue-50/50 to-slate-50 dark:from-blue-950/20 dark:to-zinc-900/50 border-blue-100 dark:border-blue-900/40">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-blue-900/40">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-blue-950 dark:text-blue-200">
                                            <BookOpen className="h-4 w-4 text-blue-600" /> Lembar Instruksi & Panduan Praktikum
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Sisipkan teks pengantar, tujuan praktikum, langkah kerja, atau tata tertib lab di antara modul-modul lain.
                                        </p>
                                    </div>
                                    <Select onValueChange={(val) => {
                                        const tmpl = INSTRUCTION_TEMPLATES.find(t => t.name === val);
                                        if (tmpl) setInstructionContent(tmpl.content);
                                    }}>
                                        <SelectTrigger className="h-8 text-xs w-56 bg-white dark:bg-zinc-800 border-blue-200">
                                            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                            <SelectValue placeholder="Pilih Contoh Panduan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INSTRUCTION_TEMPLATES.map(tmpl => (
                                                <SelectItem key={tmpl.name} value={tmpl.name}>{tmpl.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3.5 rounded-lg bg-blue-100/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <div className="font-semibold text-blue-900 dark:text-blue-200">
                                        💡 Tips Penulisan Panduan / Markdown:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                                        <li>Gunakan <code># Judul Utama</code> atau <code>## Sub Judul</code> untuk membagi bagian panduan.</li>
                                        <li>Gunakan tanda strip <code>-</code> atau angka <code>1.</code> untuk membuat daftar poin langkah kerja.</li>
                                        <li>Gunakan tanda <code>&gt; Catatan</code> untuk membuat kotak informasi / peringatan penting berwarna.</li>
                                        <li>Mendukung juga tag HTML jika Anda ingin mengatur styling khusus.</li>
                                    </ul>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="instruction-content-edit" className="text-xs font-semibold">Isi Teks Instruksi / Panduan Praktikum</Label>
                                    <Textarea
                                        name="content"
                                        id="instruction-content-edit"
                                        rows={14}
                                        value={instructionContent}
                                        onChange={(e) => setInstructionContent(e.target.value)}
                                        className="font-mono text-xs leading-relaxed"
                                        placeholder="Tulis instruksi langkah kerja praktikum di sini..."
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ==================== 1. TIPE: HTML ==================== */}
                        {type === "HTML" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                            <Code className="h-4 w-4" /> Modul Web / HTML Interactive Lab
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Jalankan simulasi kustom berbasis HTML, CSS, JavaScript, Canvas 2D, Three.js 3D, atau p5.js.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(val) => {
                                            const tmpl = HTML_LAB_TEMPLATES.find(t => t.name === val);
                                            if (tmpl) setHtmlContent(tmpl.code);
                                        }}>
                                            <SelectTrigger className="h-8 text-xs w-48 bg-white dark:bg-zinc-800">
                                                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                                <SelectValue placeholder="Pilih Template..." />
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
                                            className="h-8 text-xs bg-white dark:bg-zinc-800"
                                            onClick={() => setPreviewHtml(!previewHtml)}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            {previewHtml ? "Tutup Preview" : "Live Preview"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                        💡 Petunjuk Penggunaan Modul HTML:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                                        <li>Tulis kode lengkap mulai dari <code>&lt;!DOCTYPE html&gt;</code> beserta tag <code>&lt;style&gt;</code> dan <code>&lt;script&gt;</code> di dalamnya.</li>
                                        <li><b>Kirim Nilai Otomatis ke Sistem:</b> Tambahkan JavaScript <code>window.parent.postMessage(&#123; type: 'LAB_COMPLETE', score: 100 &#125;, '*')</code> pada tombol penyelesaian praktikum Anda.</li>
                                        <li>Anda juga dapat memasukkan tautan URL web aplikasi interaktif (misal: <code>https://my-virtual-lab.vercel.app</code>).</li>
                                    </ul>
                                </div>

                                {previewHtml && (
                                    <div className="border rounded-lg overflow-hidden h-80 bg-white">
                                        <iframe
                                            srcDoc={htmlContent}
                                            className="w-full h-full border-0"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="html-content-edit" className="text-xs font-semibold">Kode Sumber HTML / JavaScript</Label>
                                    <Textarea
                                        name="content"
                                        id="html-content-edit"
                                        rows={12}
                                        value={htmlContent}
                                        onChange={(e) => setHtmlContent(e.target.value)}
                                        className="font-mono text-xs"
                                        placeholder="Tulis kode HTML lengkap di sini..."
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ==================== 2. TIPE: INTERACTIVE VIDEO ==================== */}
                        {type === "INTERACTIVE_VIDEO" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-gradient-to-b from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-zinc-900/50 border-indigo-100 dark:border-indigo-900/40">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                                            🎥 Konfigurasi Video Interaktif + Kuis Checkpoint
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Video akan otomatis <b>berhenti (pause)</b> saat mencapai detik checkpoint dan mewajibkan mahasiswa menjawab pertanyaan kuis.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-50"
                                        onClick={() => {
                                            setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                                            setQuizJson(JSON.stringify([
                                                {
                                                    timestamp: 30,
                                                    question: "Berdasarkan penjelasan video di atas, apa fungsi utama dari komponen tersebut?",
                                                    options: [
                                                        "Mengatur dan menstabilkan tegangan sirkuit",
                                                        "Menyimpan data cadangan sistem",
                                                        "Mendinginkan mesin utama",
                                                        "Mengirim sinyal tanpa kabel"
                                                    ],
                                                    answer: 0,
                                                    explanation: "Komponen regulator tegangan berfungsi menstabilkan fluktuasi arus listrik."
                                                },
                                                {
                                                    timestamp: 75,
                                                    question: "Mengapa tahap kalibrasi wajib dilakukan sebelum pengujian?",
                                                    options: [
                                                        "Hanya sebagai formalitas dokumen",
                                                        "Untuk menjamin presisi dan akurasi data hasil ukur",
                                                        "Agar konsumsi baterai lebih hemat",
                                                        "Mempercepat waktu pengerjaan lab"
                                                    ],
                                                    answer: 1,
                                                    explanation: "Kalibrasi memastikan sensor membaca nilai aktual dengan toleransi kesalahan minimal."
                                                }
                                            ], null, 2));
                                        }}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                        Isi Contoh Kuis (Template)
                                    </Button>
                                </div>

                                <div className="p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
                                    <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                        💡 Panduan Format Parameter Kuis Checkpoint:
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                                        <div className="p-2 rounded bg-white/70 dark:bg-zinc-900/70 border border-blue-100 dark:border-blue-950">
                                            <b className="text-indigo-600 dark:text-indigo-400">timestamp</b> <i>(angka detik)</i>:
                                            <span className="block text-[11px] text-muted-foreground mt-0.5">
                                                Waktu video kuis muncul. Contoh: detik 30 = <code>30</code>, menit 1:30 = <code>90</code>, menit 2:15 = <code>135</code>.
                                            </span>
                                        </div>
                                        <div className="p-2 rounded bg-white/70 dark:bg-zinc-900/70 border border-blue-100 dark:border-blue-950">
                                            <b className="text-indigo-600 dark:text-indigo-400">question</b> <i>(teks)</i>:
                                            <span className="block text-[11px] text-muted-foreground mt-0.5">
                                                Pertanyaan yang wajib dijawab mahasiswa sebelum video lanjut.
                                            </span>
                                        </div>
                                        <div className="p-2 rounded bg-white/70 dark:bg-zinc-900/70 border border-blue-100 dark:border-blue-950">
                                            <b className="text-indigo-600 dark:text-indigo-400">options</b> <i>(array string)</i>:
                                            <span className="block text-[11px] text-muted-foreground mt-0.5">
                                                Daftar opsi pilihan ganda, contoh: <code>["Opsi A", "Opsi B", "Opsi C"]</code>.
                                            </span>
                                        </div>
                                        <div className="p-2 rounded bg-white/70 dark:bg-zinc-900/70 border border-blue-100 dark:border-blue-950">
                                            <b className="text-indigo-600 dark:text-indigo-400">answer</b> <i>(index 0, 1, 2...)</i>:
                                            <span className="block text-[11px] text-muted-foreground mt-0.5">
                                                Index pilihan yang benar (0 untuk opsi ke-1, 1 untuk opsi ke-2, dst).
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="video-url-edit" className="text-xs font-semibold">URL Video (YouTube / MP4 Direct Link)</Label>
                                    <Input
                                        id="video-url-edit"
                                        placeholder="https://www.youtube.com/watch?v=... atau https://example.com/video.mp4"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="quiz-json-edit" className="text-xs font-semibold">Data Kuis Checkpoint (JSON Array)</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(quizJson);
                                                    setQuizJson(JSON.stringify(parsed, null, 2));
                                                } catch (e) { }
                                            }}
                                        >
                                            Rapi-kan JSON (Prettify)
                                        </Button>
                                    </div>
                                    <Textarea
                                        id="quiz-json-edit"
                                        placeholder='[{"timestamp": 30, "question": "...", "options": ["A", "B"], "answer": 0}]'
                                        className={`font-mono text-xs ${jsonError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                        rows={10}
                                        value={quizJson}
                                        onChange={(e) => setQuizJson(e.target.value)}
                                    />
                                    {jsonError ? (
                                        <p className="text-xs text-red-500 font-medium">⚠️ {jsonError}</p>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                            <span>✓ Format JSON valid ({parsedQuestions.length} Checkpoint terdeteksi)</span>
                                        </div>
                                    )}
                                </div>

                                {parsedQuestions.length > 0 && !jsonError && (
                                    <div className="p-3 bg-white dark:bg-zinc-900 border rounded-lg space-y-2">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Timeline Checkpoint Terdeteksi:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {parsedQuestions.map((q, idx) => {
                                                const timeSec = Number(q.timestamp) || 0;
                                                const minutes = Math.floor(timeSec / 60);
                                                const seconds = (timeSec % 60).toString().padStart(2, "0");
                                                return (
                                                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs">
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">#{idx + 1}</span>
                                                        <span className="text-muted-foreground">({minutes}:{seconds})</span>
                                                        <span className="truncate max-w-[150px] font-medium" title={q.question}>
                                                            {q.question || "Pertanyaan"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="hidden"
                                    name="content"
                                    value={JSON.stringify({ videoUrl, questions: parsedQuestions })}
                                />
                            </div>
                        )}

                        {/* ==================== 3. TIPE: QUIZ ==================== */}
                        {type === "QUIZ" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/70 dark:border-amber-900/40">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200 dark:border-amber-900/40">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-amber-950 dark:text-amber-200">
                                            📝 Kuis Pilihan Ganda (Auto-Grading)
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Kuis interaktif dengan koreksi otomatis. Nilai mahasiswa otomatis terekam dan terhubung ke sinkronisasi SIAKAD.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border-amber-200 hover:bg-amber-50"
                                        onClick={() => setStandaloneQuizJson(JSON.stringify(QUIZ_DEFAULT_TEMPLATE, null, 2))}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                        Gunakan Template Kuis (3 Soal)
                                    </Button>
                                </div>

                                <div className="p-3.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
                                    <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                        💡 Petunjuk Format Soal Kuis:
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                                        <div className="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900">
                                            <b className="text-amber-700 dark:text-amber-400">question</b>: Teks pertanyaan kuis.
                                        </div>
                                        <div className="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900">
                                            <b className="text-amber-700 dark:text-amber-400">options</b>: Array pilihan jawaban <code>["A", "B", "C", "D"]</code>.
                                        </div>
                                        <div className="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900">
                                            <b className="text-amber-700 dark:text-amber-400">answer</b>: Index jawaban benar (0 = pilihan ke-1, 1 = pilihan ke-2, dst).
                                        </div>
                                        <div className="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900">
                                            <b className="text-amber-700 dark:text-amber-400">explanation</b>: <i>(Opsional)</i> Penjelasan / pembahasan jawaban.
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="quiz-content-edit" className="text-xs font-semibold">Struktur Data Soal (JSON Array)</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(standaloneQuizJson);
                                                    setStandaloneQuizJson(JSON.stringify(parsed, null, 2));
                                                } catch (e) { }
                                            }}
                                        >
                                            Rapi-kan JSON (Prettify)
                                        </Button>
                                    </div>
                                    <Textarea
                                        name="content"
                                        id="quiz-content-edit"
                                        rows={12}
                                        value={standaloneQuizJson}
                                        onChange={(e) => setStandaloneQuizJson(e.target.value)}
                                        className={`font-mono text-xs ${standaloneQuizError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                        placeholder='[{"question": "...", "options": ["..."], "answer": 0}]'
                                        required
                                    />
                                    {standaloneQuizError ? (
                                        <p className="text-xs text-red-500 font-medium">⚠️ {standaloneQuizError}</p>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                            <span>✓ Format JSON valid ({standaloneParsedList.length} Soal terdaftar)</span>
                                        </div>
                                    )}
                                </div>

                                {standaloneParsedList.length > 0 && !standaloneQuizError && (
                                    <div className="p-3 bg-white dark:bg-zinc-900 border rounded-lg space-y-2">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Daftar Soal Terdeteksi:
                                        </p>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                            {standaloneParsedList.map((q, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-muted/40 border">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="font-bold text-amber-600 dark:text-amber-400">Soal #{idx + 1}</span>
                                                        <span className="truncate text-muted-foreground">{q.question}</span>
                                                    </div>
                                                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono shrink-0">
                                                        Kunci: Opsi ke-{Number(q.answer) + 1}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================== 4. TIPE: SIMULATION ==================== */}
                        {type === "SIMULATION" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-purple-50/40 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/40">
                                <div className="flex items-center justify-between pb-3 border-b border-purple-200 dark:border-purple-900/40">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-purple-950 dark:text-purple-200">
                                            🔬 Simulasi Virtual Lab (PhET / Retro Emulator)
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Integrasikan simulator sains interaktif (PhET, LabXchange, ChemCollective) atau emulator game retro (EmulatorJS).
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg bg-purple-100/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs space-y-2">
                                    <div className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                                        💡 Petunjuk Penggunaan Simulasi PhET:
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Pilih preset simulasi sains populer di bawah ini, atau buka <a href="https://phet.colorado.edu" target="_blank" rel="noreferrer" className="text-purple-600 underline font-medium inline-flex items-center gap-0.5">phet.colorado.edu <ExternalLink className="h-3 w-3 inline" /></a>, pilih simulasi, klik <i>Embed</i>, dan salin URL <code>src</code> iframe-nya.
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {PHET_PRESETS.map((p) => (
                                            <Button
                                                key={p.name}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs bg-white dark:bg-zinc-800"
                                                onClick={() => {
                                                    setIsEmulator(false);
                                                    setGenericContent(p.url);
                                                }}
                                            >
                                                ⚡ {p.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-lg border">
                                    <input
                                        type="checkbox"
                                        id="emulator-mode-edit"
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        checked={isEmulator}
                                        onChange={(e) => setIsEmulator(e.target.checked)}
                                    />
                                    <Label htmlFor="emulator-mode-edit" className="font-semibold text-xs cursor-pointer">
                                        Mode Retro Emulator (EmulatorJS - Praktikum Game / Arsitektur Komputer)
                                    </Label>
                                </div>

                                {isEmulator ? (
                                    <div className="space-y-3 p-4 bg-purple-100/30 dark:bg-purple-950/20 border border-purple-200 rounded-lg animate-in fade-in">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold">Pilih Game Preset (NES/SNES/GBA)</Label>
                                            <Select onValueChange={(val) => {
                                                const game = PRESET_GAMES.find(g => g.name === val);
                                                if (game) {
                                                    setRomSystem(game.system);
                                                    setRomUrl(game.url);
                                                }
                                            }}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 text-xs">
                                                    <SelectValue placeholder="Pilih preset game retro..." />
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
                                            <Label htmlFor="rom-url-edit" className="text-xs font-semibold">URL File ROM (Direct Link)</Label>
                                            <Input
                                                id="rom-url-edit"
                                                placeholder="https://example.com/files/game.nes"
                                                value={romUrl}
                                                onChange={(e) => setRomUrl(e.target.value)}
                                                className="bg-white dark:bg-zinc-800 text-xs font-mono"
                                                required={isEmulator}
                                            />
                                        </div>

                                        <input
                                            type="hidden"
                                            name="content"
                                            value={JSON.stringify({ type: 'EMULATOR', romUrl, system: romSystem })}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label htmlFor="sim-content-edit" className="text-xs font-semibold">URL Embed Simulasi (PhET / LabXchange / GeoGebra)</Label>
                                        <Input
                                            name="content"
                                            id="sim-content-edit"
                                            value={genericContent}
                                            onChange={(e) => setGenericContent(e.target.value)}
                                            placeholder="https://phet.colorado.edu/sims/html/..._all.html"
                                            required={!isEmulator}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================== 5. TIPE: VIDEO ==================== */}
                        {type === "VIDEO" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                                <div className="pb-3 border-b">
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Video className="h-4 w-4" /> Video Pembelajaran Mandiri
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Tampilkan rekaman materi kuliah, tutorial lab, atau panduan teknis tanpa kuis checkpoint pop-up.
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <div className="font-semibold text-blue-900 dark:text-blue-200">
                                        💡 Format URL Video yang Didukung:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                                        <li><b>YouTube:</b> <code>https://www.youtube.com/watch?v=XXXX</code> atau <code>https://youtu.be/XXXX</code></li>
                                        <li><b>Direct File MP4 / WebM:</b> <code>https://domain.com/video/materi.mp4</code></li>
                                        <li><b>Google Drive:</b> Pastikan link diset publik (<i>Anyone with the link can view</i>).</li>
                                    </ul>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="video-url-edit-direct" className="text-xs font-semibold">URL Video (YouTube / Direct MP4 Link)</Label>
                                    <Input
                                        name="content"
                                        id="video-url-edit-direct"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={genericContent}
                                        onChange={(e) => setGenericContent(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ==================== 6. TIPE: PDF ==================== */}
                        {type === "PDF" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                                <div className="pb-3 border-b">
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                        <FileText className="h-4 w-4" /> Dokumen Panduan / Lembar Kerja Praktikum (PDF)
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Modul atau panduan laboratorium berformat dokumen PDF yang dapat dibaca mahasiswa di viewer bawaan.
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <div className="font-semibold text-rose-900 dark:text-rose-200">
                                        💡 Petunjuk URL Dokumen PDF:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                                        <li>Masukkan tautan berkas PDF yang dapat diakses secara publik melalui browser (misal: S3, Google Cloud Storage, CDN, atau server kampus).</li>
                                        <li>Contoh: <code>https://example.com/assets/Modul-01-Praktikum-Fisika.pdf</code></li>
                                    </ul>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pdf-content-edit" className="text-xs font-semibold">URL Berkas PDF</Label>
                                    <Input
                                        name="content"
                                        id="pdf-content-edit"
                                        placeholder="https://example.com/modul-praktikum.pdf"
                                        value={genericContent}
                                        onChange={(e) => setGenericContent(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ==================== 7. TIPE: SCORM ==================== */}
                        {type === "SCORM" && (
                            <div className="space-y-4 border p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                                <div className="pb-3 border-b">
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Layers className="h-4 w-4" /> SCORM 1.2 / HTML5 E-Learning Package
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Paket kursus interaktif hasil ekspor dari Articulate Storyline 360, Adobe Captivate, iSpring, atau Canva.
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                                    <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                                        💡 Petunjuk Paket SCORM / HTML5:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                                        <li>Ekstrak (unzip) paket SCORM yang dihasilkan dari authoring tool (Storyline / Captivate).</li>
                                        <li>Unggah folder tersebut ke web server publik atau Cloud Storage (S3 / GCP / Vercel Blob).</li>
                                        <li>Masukkan URL file <code>index.html</code> atau <code>story.html</code> utama di bawah ini.</li>
                                    </ul>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="scorm-content-edit" className="text-xs font-semibold">URL Entry Point SCORM (index.html)</Label>
                                    <Input
                                        name="content"
                                        id="scorm-content-edit"
                                        placeholder="https://storage.googleapis.com/my-lab-bucket/scorm_module_1/index.html"
                                        value={genericContent}
                                        onChange={(e) => setGenericContent(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {state?.message && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${state.message.includes("success") || state.message.includes("berhasil") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                {state.message.includes("success") || state.message.includes("berhasil") ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <span>{state.message}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                            <ModulePreviewModal
                                type={type}
                                title={title}
                                videoUrl={videoUrl}
                                quizQuestions={parsedQuestions}
                                standaloneQuizQuestions={standaloneParsedList}
                                htmlContent={htmlContent}
                                instructionContent={instructionContent}
                                genericContent={genericContent}
                                isEmulator={isEmulator}
                                romUrl={romUrl}
                                romSystem={romSystem}
                            />
                            <SubmitButton disabled={Boolean((type === "INTERACTIVE_VIDEO" && jsonError) || (type === "QUIZ" && standaloneQuizError))} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
