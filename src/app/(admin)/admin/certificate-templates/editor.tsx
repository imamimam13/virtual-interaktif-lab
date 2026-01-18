"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { createTemplate, updateTemplate } from "@/lib/certificate-actions";
import { useRouter } from "next/navigation";

// Initial state for server actions
const initialState = {
    message: ""
};

// Mock data for preview
const MOCK_DATA = {
    name: "John Doe",
    lab: "Laboratorium Manajemen Pemasaran",
    code: "CERT-12345-ABCDE",
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 100,
    instructor: "Dr. Budi Santoso"
};

export default function TemplateEditor({ template }: { template?: any }) {
    const isEdit = !!template;
    const router = useRouter();

    // Form States
    const [name, setName] = useState(template?.name || "");
    const [html, setHtml] = useState(template?.html || `<div class="cert-container">
    <h1>Sertifikat Kelulusan</h1>
    <p>Diberikan kepada:</p>
    <h2>{{name}}</h2>
    <p>Telah menyelesaikan: {{lab}}</p>
    <p class="code">No: {{code}}</p>
</div>`);
    const [css, setCss] = useState(template?.css || `.cert-container {
    text-align: center;
    border: 10px double #gold;
    padding: 50px;
}
h1 { color: #333; }
h2 { color: blue; }`);
    const [isDefault, setIsDefault] = useState(template?.isDefault || false);

    const [previewHtml, setPreviewHtml] = useState("");

    // Setup action
    const action = isEdit ? updateTemplate.bind(null, template.id) : createTemplate;
    const [state, formAction, isPending] = useActionState(action, initialState);

    // Live Preview Logic
    useEffect(() => {
        let compiled = html;
        compiled = compiled.replace(/{{name}}/g, MOCK_DATA.name);
        compiled = compiled.replace(/{{lab}}/g, MOCK_DATA.lab);
        compiled = compiled.replace(/{{code}}/g, MOCK_DATA.code);
        compiled = compiled.replace(/{{date}}/g, MOCK_DATA.date);
        compiled = compiled.replace(/{{instructor}}/g, MOCK_DATA.instructor);

        const fullHtml = `
            <style>
                ${css}
            </style>
            <div id="preview-wrapper">
                ${compiled}
            </div>
        `;
        setPreviewHtml(fullHtml);
    }, [html, css]);

    // Handle success redirect
    useEffect(() => {
        if (state.message.includes("success")) {
            router.push("/admin/certificate-templates");
        }
    }, [state, router]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/certificate-templates">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? "Edit Template" : "Buat Template Baru"}</h1>
                </div>
                <div className="flex gap-2">
                    {state?.message && (
                        <span className={`text-sm flex items-center ${state.message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                            {state.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Editor Column */}
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-20">
                    <form action={formAction} id="template-form" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Template</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Modern Blue Template"
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isDefault"
                                name="isDefault"
                                checked={isDefault}
                                onCheckedChange={(c) => setIsDefault(c as boolean)}
                            />
                            <Label htmlFor="isDefault">Jadikan Default untuk semua Lab baru</Label>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>HTML Structure</Label>
                                <span className="text-xs text-muted-foreground">Support: {'{{name}}, {{lab}}, {{code}}, {{date}}, {{instructor}}'}</span>
                            </div>
                            <Textarea
                                name="html"
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                                className="font-mono text-xs h-[200px]"
                                placeholder="<div>...</div>"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>CSS Styles</Label>
                            <Textarea
                                name="css"
                                value={css}
                                onChange={(e) => setCss(e.target.value)}
                                className="font-mono text-xs h-[200px]"
                                placeholder=".class { color: red; }"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan Template
                        </Button>
                    </form>
                </div>

                {/* Preview Column */}
                <Card className="flex flex-col h-full overflow-hidden bg-gray-100 border-4 border-dashed">
                    <CardHeader className="py-3 px-4 bg-white border-b flex flex-row justify-between items-center">
                        <CardTitle className="text-sm">Live Preview</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setHtml(html + " ")}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative overflow-hidden flex items-center justify-center">
                        <div className="scale-[0.6] origin-center w-[1123px] h-[794px] bg-white shadow-2xl relative overflow-hidden">
                            <div
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
