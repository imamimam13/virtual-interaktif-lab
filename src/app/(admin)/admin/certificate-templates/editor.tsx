"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, ArrowLeft, RefreshCw, Type, Image as ImageIcon, Move } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect, useRef } from "react";
import { createTemplate, updateTemplate } from "@/lib/certificate-actions";
import { useRouter } from "next/navigation";

// Types
type ElementType = 'name' | 'lab' | 'code' | 'date' | 'instructor' | 'text';
interface VisualElement {
    id: string;
    type: ElementType;
    label: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    text?: string; // For static text
}

const INITIAL_ELEMENTS: VisualElement[] = [
    { id: '1', type: 'name', label: 'Nama Mahasiswa', x: 50, y: 40, fontSize: 32, color: '#000000', fontWeight: 'bold', textAlign: 'center' },
    { id: '2', type: 'lab', label: 'Nama Lab', x: 50, y: 50, fontSize: 24, color: '#333333', fontWeight: 'normal', textAlign: 'center' },
    { id: '3', type: 'code', label: 'Nomor Sertifikat', x: 50, y: 60, fontSize: 14, color: '#666666', fontWeight: 'normal', textAlign: 'center' },
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
    const [backgroundUrl, setBackgroundUrl] = useState(template?.backgroundUrl || "");
    const [elements, setElements] = useState<VisualElement[]>(
        template?.elements ? JSON.parse(template.elements) : INITIAL_ELEMENTS
    );
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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
                return { ...el, x: el.x + dx, y: el.y + dy };
            }
            return el;
        }));

        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const addElement = (type: ElementType) => {
        const newEl: VisualElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: type === 'text' ? 'Teks Baru' : type.toUpperCase(),
            text: type === 'text' ? 'Static Text' : undefined,
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

    const updateSelectedElement = (key: keyof VisualElement, value: any) => {
        setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el));
    };

    const deleteSelectedElement = () => {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
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
                    overflow: hidden;
                    font-family: sans-serif;
                }
                .cert-element { position: absolute; transform: translate(-50%, -50%); width: 100%; }
            `;

            const generatedHtml = `
                <div class="cert-container">
                    ${elements.map(el => `
                        <div style="
                            left: ${el.x}%; 
                            top: ${el.y}%; 
                            font-size: ${el.fontSize}px; 
                            color: ${el.color}; 
                            font-weight: ${el.fontWeight}; 
                            text-align: ${el.textAlign};
                            position: absolute;
                            transform: translate(-50%, -50%);
                            width: 100%;
                        ">
                            ${el.type === 'text' ? el.text : `{{${el.type}}}`}
                        </div>
                    `).join('')}
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


    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/certificate-templates">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? "Edit Template" : "Buat Template Baru"}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="visual">Visual</TabsTrigger>
                            <TabsTrigger value="code">Code</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={() => document.getElementById('submit-btn')?.click()} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan
                    </Button>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* LEFT SIDEBAR (Controls) */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto pb-10">
                    <Card>
                        <CardHeader><CardTitle>Informasi Dasar</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Template</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Template Name" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox checked={isDefault} onCheckedChange={(c) => setIsDefault(!!c)} />
                                <Label>Default Template</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {mode === 'visual' ? (
                        <>
                            <Card>
                                <CardHeader><CardTitle>Global Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Background Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} placeholder="https://..." />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Gunakan gambar A4 Landscape (1123x794px)</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" onClick={() => addElement('name')}><Type className="mr-2 h-3 w-3" />+ Nama</Button>
                                        <Button variant="outline" size="sm" onClick={() => addElement('lab')}><Type className="mr-2 h-3 w-3" />+ Lab</Button>
                                        <Button variant="outline" size="sm" onClick={() => addElement('code')}><Type className="mr-2 h-3 w-3" />+ Kode</Button>
                                        <Button variant="outline" size="sm" onClick={() => addElement('date')}><Type className="mr-2 h-3 w-3" />+ Tanggal</Button>
                                        <Button variant="outline" size="sm" onClick={() => addElement('instructor')}><Type className="mr-2 h-3 w-3" />+ Instruktur</Button>
                                        <Button variant="outline" size="sm" onClick={() => addElement('text')}><Type className="mr-2 h-3 w-3" />+ Text Static</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {selectedElementId && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Element Properties</CardTitle>
                                        <Button variant="ghost" size="sm" className="text-red-500 h-6" onClick={deleteSelectedElement}>Delete</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {elements.find(el => el.id === selectedElementId)?.type === 'text' && (
                                            <div className="space-y-2">
                                                <Label>Text Content</Label>
                                                <Input
                                                    value={elements.find(el => el.id === selectedElementId)?.text}
                                                    onChange={e => updateSelectedElement('text', e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Font Size: {elements.find(el => el.id === selectedElementId)?.fontSize}px</Label>
                                            <Slider
                                                value={[elements.find(el => el.id === selectedElementId)?.fontSize || 16]}
                                                onValueChange={(v) => updateSelectedElement('fontSize', v[0])}
                                                min={8} max={72} step={1}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Color</Label>
                                                <Input
                                                    type="color"
                                                    value={elements.find(el => el.id === selectedElementId)?.color}
                                                    onChange={e => updateSelectedElement('color', e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Weight</Label>
                                                <select
                                                    className="w-full border rounded p-1 text-sm bg-background"
                                                    value={elements.find(el => el.id === selectedElementId)?.fontWeight}
                                                    onChange={e => updateSelectedElement('fontWeight', e.target.value)}
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="bold">Bold</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alignment</Label>
                                            <div className="flex border rounded overflow-hidden">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        className={`flex-1 py-1 text-xs ${elements.find(el => el.id === selectedElementId)?.textAlign === align ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                                        onClick={() => updateSelectedElement('textAlign', align)}
                                                    >
                                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardHeader><CardTitle>Code Editors</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">Manual HTML/CSS override. Switching back to visual mode will overwrite changes here unless you are careful.</p>
                                <div className="space-y-2">
                                    <Label>HTML</Label>
                                    <Textarea value={html} onChange={e => setHtml(e.target.value)} className="font-mono text-xs h-[150px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label>CSS</Label>
                                    <Textarea value={css} onChange={e => setCss(e.target.value)} className="font-mono text-xs h-[150px]" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* MAIN AREA (Canvas / Preview) */}
                <div className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center">
                    {mode === 'visual' ? (
                        <div
                            className="bg-white shadow-2xl relative overflow-hidden select-none"
                            style={{
                                width: '1123px',
                                height: '794px',
                                transform: 'scale(0.8)',
                                transformOrigin: 'top center',
                                backgroundImage: `url('${backgroundUrl}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                            ref={canvasRef}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {!backgroundUrl && <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">No Background Image</div>}

                            {elements.map(el => (
                                <div
                                    key={el.id}
                                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                                    className={`absolute cursor-move border-2 ${selectedElementId === el.id ? 'border-blue-500 bg-blue-50/20' : 'border-transparent hover:border-gray-300'}`}
                                    style={{
                                        left: `${el.x}%`,
                                        top: `${el.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        width: '100%',
                                        textAlign: el.textAlign,
                                        fontSize: `${el.fontSize}px`,
                                        color: el.color,
                                        fontWeight: el.fontWeight,
                                    }}
                                >
                                    {el.type === 'text' ? el.text : MOCK_DATA[el.type as keyof typeof MOCK_DATA]}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white shadow-2xl w-[1123px] h-[794px] overflow-hidden scale-[0.8] origin-top">
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
