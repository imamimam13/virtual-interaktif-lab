"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSystemConfig } from "@/lib/admin-actions";
import { Key, ShieldCheck, Copy, Check, RefreshCw, Globe } from "lucide-react";
import { toast } from "sonner";

interface SiakadConfigCardProps {
    currentApiKey: string;
    currentSsoSecret: string;
}

export default function SiakadConfigCard({ currentApiKey, currentSsoSecret }: SiakadConfigCardProps) {
    const [apiKey, setApiKey] = useState(currentApiKey);
    const [ssoSecret, setSsoSecret] = useState(currentSsoSecret);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                updateSystemConfig("SIAKAD_API_KEY", apiKey),
                updateSystemConfig("SIAKAD_SSO_SECRET", ssoSecret),
            ]);
            toast.success("Konfigurasi integrasi SIAKAD berhasil disimpan!");
        } catch {
            toast.error("Gagal menyimpan konfigurasi SIAKAD");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        toast.success("Tersalin ke clipboard!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleGenerateRandom = (type: "api" | "sso") => {
        const randomStr = "vl_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        if (type === "api") setApiKey(randomStr);
        if (type === "sso") setSsoSecret(randomStr + "_sso");
    };

    return (
        <Card className="border-indigo-500/30 bg-gradient-to-br from-white to-indigo-50/20 dark:from-zinc-950 dark:to-indigo-950/10">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Integrasi SIAKAD & Single Sign-On (SSO)</CardTitle>
                        <CardDescription>
                            Kunci otentikasi REST API dan secret JWT untuk menghubungkan Virtual Lab dengan sistem SIAKAD kampus.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5 font-medium">
                                <Key className="h-3.5 w-3.5 text-indigo-500" /> SIAKAD API Key
                            </Label>
                            <button
                                type="button"
                                onClick={() => handleGenerateRandom("api")}
                                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" /> Buat Acak
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="siakad-vlabs-secret-key-..."
                                className="font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(apiKey, "apiKey")}
                                title="Salin API Key"
                            >
                                {copiedKey === "apiKey" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Digunakan SIAKAD pada header <code>x-api-key</code> atau <code>Authorization: Bearer</code>.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5 font-medium">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SIAKAD SSO JWT Secret
                            </Label>
                            <button
                                type="button"
                                onClick={() => handleGenerateRandom("sso")}
                                className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" /> Buat Acak
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={ssoSecret}
                                onChange={(e) => setSsoSecret(e.target.value)}
                                placeholder="siakad-vlabs-sso-jwt-..."
                                className="font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(ssoSecret, "ssoSecret")}
                                title="Salin SSO Secret"
                            >
                                {copiedKey === "ssoSecret" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Kunci rahasia untuk memverifikasi tanda tangan digital token JWT SSO 1-klik.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-slate-100 dark:bg-zinc-900/80 p-4 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        <Globe className="h-4 w-4 text-indigo-500" /> Endpoint Integrasi yang Tersedia:
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-zinc-400">
                        <div className="p-2 rounded bg-white dark:bg-zinc-950 border flex justify-between items-center">
                            <span>GET /api/integration/ping</span>
                            <span className="text-[10px] text-emerald-500 font-sans font-semibold">Health Check</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-zinc-950 border flex justify-between items-center">
                            <span>POST /api/integration/sync-users</span>
                            <span className="text-[10px] text-indigo-500 font-sans font-semibold">Sync User</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-zinc-950 border flex justify-between items-center">
                            <span>POST /api/integration/create-or-link-lab</span>
                            <span className="text-[10px] text-purple-500 font-sans font-semibold">Link Lab</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-zinc-950 border flex justify-between items-center">
                            <span>GET /api/integration/labs/:id/grades</span>
                            <span className="text-[10px] text-amber-500 font-sans font-semibold">Pull Grades</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-zinc-950 border flex justify-between items-center md:col-span-2">
                            <span>GET /sso-login?token=&lt;JWT&gt;&amp;redirectUrl=&lt;URL&gt;</span>
                            <span className="text-[10px] text-emerald-500 font-sans font-semibold">SSO Login</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isSaving ? "Menyimpan..." : "Simpan Kunci SIAKAD"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
