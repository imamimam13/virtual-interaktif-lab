"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader2, Save, ArrowLeft, RefreshCw, Type, Image as ImageIcon, Move, Upload, Sparkles, Trash2, Stamp, PenTool } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect, useRef } from "react";
import { createTemplate, updateTemplate } from "@/lib/certificate-actions";
import { uploadCertificateAsset } from "@/lib/upload-actions";
import { useRouter } from "next/navigation";

// Types
export type ElementType = 'name' | 'lab' | 'code' | 'date' | 'instructor' | 'text' | 'image';

export interface VisualElement {
    id: string;
    type: ElementType;
    label: string;
    x: number;
    y: number;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    text?: string; // For static text
    imageUrl?: string; // For logo, stamp, signature, illustration
    width?: number; // In px
    height?: number; // In px
    opacity?: number; // 0.1 to 1.0
}

const PRESET_BACKGROUNDS = [
    {
        name: "Classic Navy & Gold",
        url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794"><rect width="1123" height="794" fill="%23fdfbf7"/><rect x="25" y="25" width="1073" height="744" fill="none" stroke="%231e3a8a" stroke-width="4"/><rect x="35" y="35" width="1053" height="724" fill="none" stroke="%23d97706" stroke-width="2"/><g fill="%23d97706"><polygon points="25,25 65,25 25,65"/><polygon points="1098,25 1058,25 1098,65"/><polygon points="25,769 65,769 25,729"/><polygon points="1098,769 1058,769 1098,729"/></g><circle cx="561.5" cy="397" r="180" fill="%231e3a8a" opacity="0.02"/></svg>`
    },
    {
        name: "Academic Emerald",
        url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794"><rect width="1123" height="794" fill="%23fcfdfc"/><rect x="25" y="25" width="1073" height="744" fill="none" stroke="%23065f46" stroke-width="5"/><rect x="35" y="35" width="1053" height="724" fill="none" stroke="%2310b981" stroke-width="1.5"/><g fill="%23065f46"><circle cx="45" cy="45" r="8"/><circle cx="1078" cy="45" r="8"/><circle cx="45" cy="749" r="8"/><circle cx="1078" cy="749" r="8"/></g></svg>`
    },
    {
        name: "Royal Crimson & Gold",
        url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794"><rect width="1123" height="794" fill="%23fffefa"/><rect x="30" y="30" width="1063" height="734" fill="none" stroke="%23991b1b" stroke-width="4"/><rect x="40" y="40" width="1043" height="714" fill="none" stroke="%23eab308" stroke-width="2"/><g fill="%23eab308"><polygon points="30,30 70,30 30,70"/><polygon points="1093,30 1053,30 1093,70"/><polygon points="30,764 70,764 30,724"/><polygon points="1093,764 1053,764 1093,724"/></g></svg>`
    }
];

const INITIAL_ELEMENTS: VisualElement[] = [
    { id: '1', type: 'name', label: 'Nama Mahasiswa', x: 50, y: 45, fontSize: 34, color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '2', type: 'lab', label: 'Nama Lab', x: 50, y: 58, fontSize: 24, color: '#1e3a8a', fontWeight: 'bold', textAlign: 'center' },
    { id: '3', type: 'code', label: 'Nomor Sertifikat', x: 50, y: 28, fontSize: 13, color: '#64748b', fontWeight: 'normal', textAlign: 'center' },
    { id: '4', type: 'date', label: 'Tanggal', x: 50, y: 68, fontSize: 14, color: '#475569', fontWeight: 'normal', textAlign: 'center' },
    { id: '5', type: 'instructor', label: 'Instruktur', x: 25, y: 84, fontSize: 15, color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '6', type: 'text', text: 'Kepala LPPM', label: 'LPPM', x: 75, y: 84, fontSize: 15, color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
];

const MOCK_DATA = {
    name: "John Doe",
    lab: "Laboratorium Manajemen Pemasaran",
    code: "CERT-12345-ABCDE",
    date: "12 Januari 2024",
    instructor: "Dr. Budi Santoso"
};

export default function TemplateEditor({ template }: { template?: any }) {
    const isEdit = !!template;
    const router = useRouter();

    // Mode: 'visual' | 'code'
    const [mode, setMode] = useState<'visual' | 'code'>(template?.elements ? 'visual' : 'code');

    // Common State
    const [name, setName] = useState(template?.name || "");
    const [isDefault, setIsDefault] = useState(template?.isDefault || false);

    // Code Editor State
    const [html, setHtml] = useState(template?.html || "");
    const [css, setCss] = useState(template?.css || "");

    // Visual Editor State
    const [backgroundUrl, setBackgroundUrl] = useState(template?.backgroundUrl || PRESET_BACKGROUNDS[0].url);
    const [elements, setElements] = useState<VisualElement[]>(
        template?.elements ? JSON.parse(template.elements) : INITIAL_ELEMENTS
    );
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Uploading status
    const [isUploadingBg, setIsUploadingBg] = useState(false);
    const [isUploadingElement, setIsUploadingElement] = useState(false);

    // Refs
    const bgFileInputRef = useRef<HTMLInputElement>(null);
    const elFileInputRef = useRef<HTMLInputElement>(null);

    // Preview
    const [previewHtml, setPreviewHtml] = useState("");

    // Action Setup
    const action = isEdit ? updateTemplate.bind(null, template.id) : createTemplate;
    const [state, formAction, isPending] = useActionState(action, { message: "" });

    // --- Visual Editor Logic ---
    const canvasRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        if (mode !== 'visual') return;
        e.stopPropagation();
        setSelectedElementId(id);
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !selectedElementId || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = 100 / rect.width;
        const scaleY = 100 / rect.height;

        const dx = (e.clientX - dragStart.current.x) * scaleX;
        const dy = (e.clientY - dragStart.current.y) * scaleY;

        setElements(prev => prev.map(el => {
            if (el.id === selectedElementId) {
                return { 
                    ...el, 
                    x: Math.max(0, Math.min(100, Math.round((el.x + dx) * 10) / 10)), 
                    y: Math.max(0, Math.min(100, Math.round((el.y + dy) * 10) / 10)) 
                };
            }
            return el;
        }));

        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const addElement = (type: ElementType, customLabel?: string) => {
        const newEl: VisualElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: customLabel || (type === 'text' ? 'Teks Baru' : type.toUpperCase()),
            text: type === 'text' ? 'Teks Tambahan' : undefined,
            x: 50,
            y: 50,
            fontSize: 18,
            color: '#000000',
            fontWeight: 'normal',
            textAlign: 'center'
        };
        setElements([...elements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const addImageElement = (label: string = "Logo Kampus", defaultUrl: string = "") => {
        const newEl: VisualElement = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            label,
            imageUrl: defaultUrl,
            x: 50,
            y: 20,
            width: 100,
            opacity: 1
        };
        setElements([...elements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const updateSelectedElement = (key: keyof VisualElement, value: any) => {
        setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el));
    };

    const deleteSelectedElement = () => {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    };

    // Helper to read file as data URL fallback
    const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Background Image Upload Handler
    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingBg(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/certificate", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.url) {
                    setBackgroundUrl(data.url);
                    return;
                }
            }

            // If API responded with error or not ok, fallback to client-side data URL
            const localDataUrl = await readFileAsDataUrl(file);
            setBackgroundUrl(localDataUrl);
        } catch (err) {
            console.warn("Upload fetch failed, using local Data URL fallback:", err);
            try {
                const localDataUrl = await readFileAsDataUrl(file);
                setBackgroundUrl(localDataUrl);
            } catch (fallbackErr) {
                alert("Gagal memuat file gambar background. Pastikan file berupa gambar yang valid.");
            }
        } finally {
            setIsUploadingBg(false);
            if (e.target) e.target.value = "";
        }
    };

    // Element Image Upload Handler
    const handleElementImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedElementId) return;

        setIsUploadingElement(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/certificate", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.url) {
                    updateSelectedElement("imageUrl", data.url);
                    return;
                }
            }

            // Fallback to client-side data URL
            const localDataUrl = await readFileAsDataUrl(file);
            updateSelectedElement("imageUrl", localDataUrl);
        } catch (err) {
            console.warn("Upload fetch failed, using local Data URL fallback:", err);
            try {
                const localDataUrl = await readFileAsDataUrl(file);
                updateSelectedElement("imageUrl", localDataUrl);
            } catch (fallbackErr) {
                alert("Gagal memuat file gambar.");
            }
        } finally {
            setIsUploadingElement(false);
            if (e.target) e.target.value = "";
        }
    };

    // Auto-Generate HTML/CSS from Visual State
    useEffect(() => {
        if (mode === 'visual') {
            const generatedCss = `
                @page { size: A4 landscape; margin: 0; }
                .cert-container {
                    width: 297mm; height: 209mm;
                    position: relative;
                    background-image: url('${backgroundUrl}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    overflow: hidden;
                    font-family: 'Times New Roman', Times, Georgia, serif;
                }
                .cert-element { position: absolute; transform: translate(-50%, -50%); width: 100%; }
            `;

            const generatedHtml = `
                <div class="cert-container">
                    ${elements.map(el => {
                        if (el.type === 'image') {
                            return `
                                <div style="
                                    left: ${el.x}%; 
                                    top: ${el.y}%; 
                                    position: absolute; 
                                    transform: translate(-50%, -50%);
                                    z-index: 5;
                                ">
                                    ${el.imageUrl ? `<img src="${el.imageUrl}" style="width: ${el.width || 100}px; opacity: ${el.opacity ?? 1}; display: block;" />` : `<div style="width: ${el.width || 100}px; height: 60px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">Placeholder Gambar</div>`}
                                </div>
                            `;
                        }
                        return `
                            <div style="
                                left: ${el.x}%; 
                                top: ${el.y}%; 
                                font-size: ${el.fontSize || 16}px; 
                                color: ${el.color || '#000000'}; 
                                font-weight: ${el.fontWeight || 'normal'}; 
                                text-align: ${el.textAlign || 'center'};
                                position: absolute;
                                transform: translate(-50%, -50%);
                                width: 100%;
                                z-index: 10;
                            ">
                                ${el.type === 'text' ? el.text : `{{${el.type}}}`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            setHtml(generatedHtml);
            setCss(generatedCss);
        }
    }, [mode, elements, backgroundUrl]);


    // Preview Generator
    useEffect(() => {
        let compiled = html;
        compiled = compiled.replace(/{{name}}/g, MOCK_DATA.name);
        compiled = compiled.replace(/{{lab}}/g, MOCK_DATA.lab);
        compiled = compiled.replace(/{{code}}/g, MOCK_DATA.code);
        compiled = compiled.replace(/{{date}}/g, MOCK_DATA.date);
        compiled = compiled.replace(/{{instructor}}/g, MOCK_DATA.instructor);

        const fullHtml = `
            <style>${css}</style>
            <div id="preview-wrapper">${compiled}</div>
        `;
        setPreviewHtml(fullHtml);
    }, [html, css]);

    // Redirect on success
    useEffect(() => {
        if (state.message.includes("success")) router.push("/admin/certificate-templates");
    }, [state, router]);

    const selectedEl = elements.find(el => el.id === selectedElementId);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/certificate-templates">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{isEdit ? "Edit Template Sertifikat" : "Buat Template Sertifikat Baru"}</h1>
                        <p className="text-xs text-muted-foreground">Rancang sertifikat dengan background dan logo kampus kustom</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                            <TabsTrigger value="code">Code HTML/CSS</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={() => document.getElementById('submit-btn')?.click()} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Template
                    </Button>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* LEFT SIDEBAR (Controls) */}
                <div className="w-84 flex flex-col gap-4 overflow-y-auto pb-10">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm">Informasi Dasar</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Nama Template</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Sertifikat Resmi UWB Gold" />
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox checked={isDefault} onCheckedChange={(c) => setIsDefault(!!c)} />
                                <Label className="text-xs">Jadikan Template Default Sistem</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {mode === 'visual' ? (
                        <>
                            {/* Background Image & Presets */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center justify-between">
                                        <span>Background Sertifikat</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Upload Button */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={bgFileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleBgUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            disabled={isUploadingBg}
                                            onClick={() => bgFileInputRef.current?.click()}
                                        >
                                            {isUploadingBg ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                                            Upload Gambar Background
                                        </Button>
                                    </div>

                                    {/* Preset Backgrounds */}
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Sparkles className="h-3 w-3 text-amber-500" /> Atau Pilih Preset Resmi:
                                        </Label>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {PRESET_BACKGROUNDS.map((bg, idx) => (
                                                <Button
                                                    key={idx}
                                                    type="button"
                                                    variant={backgroundUrl === bg.url ? "default" : "secondary"}
                                                    size="sm"
                                                    className="justify-start text-xs h-7 px-2"
                                                    onClick={() => setBackgroundUrl(bg.url)}
                                                >
                                                    {bg.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-1">
                                        <Label className="text-[11px] text-muted-foreground">Atau masukkan URL Background:</Label>
                                        <Input
                                            value={backgroundUrl}
                                            onChange={e => setBackgroundUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="text-xs h-7"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Add Elements Toolbox */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Tambah Elemen Sertifikat</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('name')}><Type className="mr-1.5 h-3 w-3" />+ Nama</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('lab')}><Type className="mr-1.5 h-3 w-3" />+ Nama Lab</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('code')}><Type className="mr-1.5 h-3 w-3" />+ Nomor Sertifikat</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('date')}><Type className="mr-1.5 h-3 w-3" />+ Tanggal</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('instructor')}><Type className="mr-1.5 h-3 w-3" />+ Instruktur</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => addElement('text')}><Type className="mr-1.5 h-3 w-3" />+ Teks Custom</Button>
                                    </div>

                                    <div className="pt-2 border-t space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-muted-foreground">Logo & Tanda Tangan:</Label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <Button variant="secondary" size="sm" className="text-xs h-8" onClick={() => addImageElement('Logo Kampus')}>
                                                <ImageIcon className="mr-1.5 h-3 w-3 text-blue-600" /> + Logo Kampus
                                            </Button>
                                            <Button variant="secondary" size="sm" className="text-xs h-8" onClick={() => addImageElement('Stempel LPPM')}>
                                                <Stamp className="mr-1.5 h-3 w-3 text-amber-600" /> + Stempel
                                            </Button>
                                            <Button variant="secondary" size="sm" className="text-xs h-8 col-span-2" onClick={() => addImageElement('Tanda Tangan Dosen')}>
                                                <PenTool className="mr-1.5 h-3 w-3 text-indigo-600" /> + Tanda Tangan Digital
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Selected Element Properties */}
                            {selectedEl && (
                                <Card className="border-blue-300 dark:border-blue-900 shadow-md">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-semibold">Pengaturan Elemen</CardTitle>
                                            <p className="text-[11px] text-muted-foreground">{selectedEl.label}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-500 h-7 px-2 hover:bg-red-50 dark:hover:bg-red-950" onClick={deleteSelectedElement}>
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3.5">
                                        {/* Image Properties */}
                                        {selectedEl.type === 'image' ? (
                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Gambar / Logo</Label>
                                                    <input
                                                        type="file"
                                                        ref={elFileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleElementImgUpload}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs"
                                                        disabled={isUploadingElement}
                                                        onClick={() => elFileInputRef.current?.click()}
                                                    >
                                                        {isUploadingElement ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                                                        Upload Gambar / Logo
                                                    </Button>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] text-muted-foreground">Atau masukkan URL Gambar:</Label>
                                                    <Input
                                                        value={selectedEl.imageUrl || ""}
                                                        onChange={e => updateSelectedElement('imageUrl', e.target.value)}
                                                        placeholder="https://.../logo.png"
                                                        className="text-xs h-7"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <Label className="text-xs">Ukuran Lebar: {selectedEl.width || 100}px</Label>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="30" max="400" step="5"
                                                        value={selectedEl.width || 100}
                                                        onChange={(e) => updateSelectedElement('width', parseInt(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <Label className="text-xs">Transparansi: {Math.round((selectedEl.opacity ?? 1) * 100)}%</Label>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.1" max="1" step="0.05"
                                                        value={selectedEl.opacity ?? 1}
                                                        onChange={(e) => updateSelectedElement('opacity', parseFloat(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            /* Text Properties */
                                            <div className="space-y-3">
                                                {selectedEl.type === 'text' && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Isi Teks</Label>
                                                        <Input
                                                            value={selectedEl.text || ""}
                                                            onChange={e => updateSelectedElement('text', e.target.value)}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <Label className="text-xs">Ukuran Font: {selectedEl.fontSize}px</Label>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="10" max="72" step="1"
                                                        value={selectedEl.fontSize || 16}
                                                        onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Warna</Label>
                                                        <Input
                                                            type="color"
                                                            value={selectedEl.color || "#000000"}
                                                            onChange={e => updateSelectedElement('color', e.target.value)}
                                                            className="h-7 p-0.5 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Ketebalan</Label>
                                                        <select
                                                            className="w-full border rounded h-7 text-xs px-1 bg-background"
                                                            value={selectedEl.fontWeight || "normal"}
                                                            onChange={e => updateSelectedElement('fontWeight', e.target.value)}
                                                        >
                                                            <option value="normal">Normal</option>
                                                            <option value="bold">Bold (Tebal)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Perataan (Align)</Label>
                                                    <div className="flex border rounded overflow-hidden">
                                                        {['left', 'center', 'right'].map((align) => (
                                                            <button
                                                                key={align}
                                                                type="button"
                                                                className={`flex-1 py-1 text-xs ${selectedEl.textAlign === align ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}`}
                                                                onClick={() => updateSelectedElement('textAlign', align)}
                                                            >
                                                                {align.charAt(0).toUpperCase() + align.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Coordinates info */}
                                        <div className="pt-2 border-t flex justify-between text-[11px] text-muted-foreground">
                                            <span>Posisi X: <strong>{selectedEl.x}%</strong></span>
                                            <span>Posisi Y: <strong>{selectedEl.y}%</strong></span>
                                            <span className="text-blue-500 font-medium">Tarik untuk geser</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardHeader><CardTitle className="text-sm">Code Editors</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">Kustomisasi manual kode HTML & CSS untuk sertifikat tingkat lanjut.</p>
                                <div className="space-y-2">
                                    <Label className="text-xs font-mono">HTML</Label>
                                    <Textarea value={html} onChange={e => setHtml(e.target.value)} className="font-mono text-xs h-[180px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-mono">CSS</Label>
                                    <Textarea value={css} onChange={e => setCss(e.target.value)} className="font-mono text-xs h-[180px]" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* MAIN AREA (Canvas / Preview) */}
                <div className="flex-1 bg-slate-900/10 dark:bg-slate-950 p-6 overflow-auto flex items-start justify-center rounded-xl border">
                    {mode === 'visual' ? (
                        <div
                            className="bg-white shadow-2xl relative overflow-hidden select-none transition-all rounded-sm"
                            style={{
                                width: '1123px',
                                height: '794px',
                                minWidth: '1123px',
                                minHeight: '794px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top center',
                                backgroundImage: `url('${backgroundUrl}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                            ref={canvasRef}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {!backgroundUrl && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                                    Belum ada Background Image
                                </div>
                            )}

                            {elements.map(el => {
                                const isSelected = selectedElementId === el.id;
                                if (el.type === 'image') {
                                    return (
                                        <div
                                            key={el.id}
                                            onMouseDown={(e) => handleMouseDown(e, el.id)}
                                            className={`absolute cursor-move border-2 rounded p-1 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/40 shadow-xl ring-2 ring-blue-400' : 'border-dashed border-gray-400/50 hover:border-gray-600'}`}
                                            style={{
                                                left: `${el.x}%`,
                                                top: `${el.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: isSelected ? 40 : 15,
                                            }}
                                        >
                                            {el.imageUrl ? (
                                                <img
                                                    src={el.imageUrl}
                                                    alt={el.label}
                                                    style={{
                                                        width: `${el.width || 100}px`,
                                                        opacity: el.opacity ?? 1,
                                                        pointerEvents: 'none',
                                                        display: 'block'
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-white/90 border flex flex-col items-center justify-center text-gray-600 p-2 text-xs rounded shadow-sm"
                                                    style={{ width: `${el.width || 100}px`, height: '70px' }}
                                                >
                                                    <ImageIcon className="h-5 w-5 mb-1 text-blue-500" />
                                                    <span className="text-[10px] font-medium">{el.label}</span>
                                                    <span className="text-[9px] text-blue-600 font-bold">Upload</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => handleMouseDown(e, el.id)}
                                        className={`absolute cursor-move border-2 rounded px-2 py-0.5 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-400' : 'border-transparent hover:border-dashed hover:border-gray-400'}`}
                                        style={{
                                            left: `${el.x}%`,
                                            top: `${el.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            width: '100%',
                                            textAlign: el.textAlign,
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontWeight: el.fontWeight,
                                            zIndex: isSelected ? 40 : 20,
                                        }}
                                    >
                                        {el.type === 'text' ? el.text : MOCK_DATA[el.type as keyof typeof MOCK_DATA]}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white shadow-2xl w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] overflow-hidden scale-[0.75] origin-top rounded-sm">
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Form for Submission */}
            <form action={formAction} className="hidden">
                <input name="name" value={name} onChange={() => { }} />
                <input name="html" value={html} onChange={() => { }} />
                <input name="css" value={css} onChange={() => { }} />
                <input name="backgroundUrl" value={backgroundUrl} onChange={() => { }} />
                <input name="elements" value={JSON.stringify(elements)} onChange={() => { }} />
                <input type="checkbox" name="isDefault" checked={isDefault} onChange={() => { }} />
                <button type="submit" id="submit-btn"></button>
            </form>
        </div>
    );
}
