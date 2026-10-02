"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, CheckCircle2, AlertCircle, Sparkles, HelpCircle, Code2, RotateCcw } from "lucide-react";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createLab, updateLab, LabFormState } from "@/lib/admin-actions";

const GRADING_PRESETS = [
    {
        label: "50% Kuis + 50% Simulasi",
        json: '{\n  "QUIZ": 50,\n  "SIMULATION": 50\n}'
    },
    {
        label: "10% Video + 40% Kuis + 50% Simulasi",
        json: '{\n  "VIDEO": 10,\n  "QUIZ": 40,\n  "SIMULATION": 50\n}'
    },
    {
        label: "50% Kuis + 50% Video Interaktif",
        json: '{\n  "QUIZ": 50,\n  "INTERACTIVE_VIDEO": 50\n}'
    },
    {
        label: "100% Kuis",
        json: '{\n  "QUIZ": 100\n}'
    }
];

type Department = {
    id: string;
    name: string;
};

type Template = {
    id: string;
    name: string;
    isDefault: boolean;
};

type LabData = {
    id: string;
    title: string;
    description: string;
    departmentId: string | null;
    certificateTemplateId?: string | null;
    isPublic?: boolean;
    thumbnail: string | null;
    instructor: string | null;
    grading: string | null;
    price: number;
    requestedPrice?: number;
    feePercentage: number;
    lppmFeePercentage: number;
    bankDetails: string | null;
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? "Simpan Perubahan" : "Buat Laboratorium"}
        </Button>
    );
}

export default function LabForm({
    departments,
    templates,
    initialData,
    role = "LECTURER",
    currentUserName = "",
    defaultDosenFee = 50,
    defaultLppmFee = 10
}: {
    departments: Department[],
    templates?: Template[],
    initialData?: LabData,
    role?: string,
    currentUserName?: string,
    defaultDosenFee?: number,
    defaultLppmFee?: number
}) {
    const isEdit = !!initialData;
    const isLecturer = role === "LECTURER";
    const [isIndependent, setIsIndependent] = useState(initialData ? !initialData.departmentId : false);
    const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);

    // State for form validation
    const initialState: LabFormState = { message: null, errors: {}, payload: null };
    // Choose action based on mode
    const action = isEdit ? updateLab : createLab;
    const [state, dispatch] = useActionState(action, initialState);

    const [gradingInput, setGradingInput] = useState<string>(
        state?.payload?.grading || initialData?.grading || ""
    );

    // Calculate validation & total weight
    let parsedGrading: Record<string, any> | null = null;
    let gradingParseError: string | null = null;
    let totalWeight = 0;

    if (gradingInput.trim()) {
        try {
            parsedGrading = JSON.parse(gradingInput);
            if (typeof parsedGrading === "object" && parsedGrading !== null && !Array.isArray(parsedGrading)) {
                totalWeight = Object.values(parsedGrading).reduce((acc: number, val: any) => {
                    const num = Number(val);
                    return acc + (isNaN(num) ? 0 : num);
                }, 0);
            } else {
                gradingParseError = "Format harus berupa objek JSON (contoh: { \"QUIZ\": 50, \"SIMULATION\": 50 })";
            }
        } catch (e: any) {
            gradingParseError = "Format JSON belum valid (cek tanda kurung {} atau koma)";
        }
    }

    const defaultInstructorValue = state?.payload?.instructor || initialData?.instructor || (isLecturer ? currentUserName : "");

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ... Header codes ... */}
            <div>
                <h1 className="text-3xl font-bold">{isEdit ? "Edit Laboratorium" : "Buat Laboratorium Baru"}</h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Perbarui informasi laboratorium." : "Tambahkan modul praktikum virtual baru ke sistem."}
                </p>
                {initialData?.requestedPrice && initialData.requestedPrice > 0 && initialData.price === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <strong>Menunggu Review:</strong> Anda mengajukan harga <strong>Rp {initialData.requestedPrice.toLocaleString()}</strong>. Saat ini Lab masih <strong>Gratis</strong> sampai disetujui Admin.
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Lab</CardTitle>
                    <CardDescription>Detail dasar laboratorium yang akan ditampilkan kepada mahasiswa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        {isEdit && <input type="hidden" name="id" value={initialData.id} />}

                        {/* ... Title, Desc, Independent ... (Keep existing code above line 152) */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Nama Laboratorium</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Contoh: Lab Manajemen Pemasaran Digital"
                                required
                                defaultValue={state?.payload?.title || initialData?.title || ""}
                            />
                            {state?.errors?.title && <p className="text-sm text-red-500">{state.errors.title}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="instructor">Nama Dosen / Instruktur Pengampu</Label>
                            <Input
                                id="instructor"
                                name="instructor"
                                placeholder="Contoh: Dr. Budi Santoso"
                                defaultValue={defaultInstructorValue}
                                readOnly={isLecturer && !!currentUserName}
                                className={isLecturer && currentUserName ? "bg-muted font-medium cursor-not-allowed" : ""}
                            />
                            <p className="text-xs text-muted-foreground">
                                {isLecturer
                                    ? "Laboratorium akan otomatis dikaitkan dengan akun Dosen Anda."
                                    : "Nama dosen yang bertanggung jawab atas modul lab ini."}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="desc">Deskripsi Singkat</Label>
                            <Textarea
                                id="desc"
                                name="description"
                                placeholder="Jelaskan tujuan dan materi yang akan dipelajari..."
                                required
                                defaultValue={state?.payload?.description || initialData?.description || ""}
                            />
                            {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description}</p>}
                        </div>

                        <div className="flex items-center space-x-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <Switch
                                id="independent-mode"
                                name="isIndependent"
                                defaultChecked={isIndependent}
                                checked={isIndependent}
                                onCheckedChange={setIsIndependent}
                            />
                            <input type="hidden" name="isIndependent" value={isIndependent.toString()} />
                            <div className="flex-1">
                                <Label htmlFor="independent-mode" className="text-base font-medium">Lab Independen</Label>
                                <p className="text-sm text-muted-foreground">
                                    Jika aktif, lab ini tidak terikat pada Program Studi tertentu (General).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 border p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <Switch
                                id="public-mode"
                                name="isPublic"
                                defaultChecked={isPublic}
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                            <input type="hidden" name="isPublic" value={isPublic.toString()} />
                            <div className="flex-1">
                                <Label htmlFor="public-mode" className="text-base font-medium">Public / Demo Lab</Label>
                                <p className="text-sm text-muted-foreground">
                                    Jika aktif, lab ini dapat diakses oleh publik (tanpa login) sebagai demo.
                                    <br /><span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">Note: Tidak ada tracking progress atau sertifikat untuk user public.</span>
                                </p>
                            </div>
                        </div>

                        {!isIndependent && (
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Program Studi</Label>
                                <Select name="departmentId" defaultValue={state?.payload?.departmentId || initialData?.departmentId || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Prodi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-semibold">Konfigurasi Harga & Revenue</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">{isLecturer ? "Ajukan Harga (Rp) - Menunggu Approval" : "Harga Lab (Rp)"}</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        defaultValue={state?.payload?.price || (isLecturer && initialData?.requestedPrice ? initialData.requestedPrice : initialData?.price) || 0}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">{isLecturer ? "Harga akan aktif setelah disetujui Admin." : "Set 0 untuk Gratis."}</p>
                                    {state?.errors?.price && <p className="text-sm text-red-500">{state.errors.price}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bankDetails">Bank / Info Pembayaran</Label>
                                    <Input
                                        id="bankDetails"
                                        name="bankDetails"
                                        placeholder="BCA 123456789 a.n Universitas"
                                        defaultValue={state?.payload?.bankDetails || initialData?.bankDetails || ""}
                                    />
                                    <p className="text-xs text-muted-foreground">Ditampilkan ke siswa saat pembayaran.</p>
                                </div>
                            </div>

                            {isLecturer ? (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    <strong>Ketentuan Revenue Sharing:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        <li>Fee Instruktur: {defaultDosenFee}%</li>
                                        <li>Fee LPPM: {defaultLppmFee}%</li>
                                        <li>Fee Platform (Admin): {100 - defaultDosenFee - defaultLppmFee}%</li>
                                    </ul>
                                    <p className="mt-2 text-xs">Hubungi Admin jika Anda memiliki kesepakatan khusus.</p>
                                    <input type="hidden" name="feePercentage" value={defaultDosenFee} />
                                    <input type="hidden" name="lppmFeePercentage" value={defaultLppmFee} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="grid gap-2">
                                        <Label htmlFor="feePercentage">Fee Dosen (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="feePercentage"
                                                name="feePercentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="w-24"
                                                defaultValue={state?.payload?.feePercentage !== undefined ? state.payload.feePercentage : initialData?.feePercentage ?? 50}
                                            />
                                            <span className="text-sm font-medium">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Share untuk Instruktur/Dosen.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lppmFeePercentage">Fee LPPM (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="lppmFeePercentage"
                                                name="lppmFeePercentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="w-24"
                                                defaultValue={state?.payload?.lppmFeePercentage !== undefined ? state.payload.lppmFeePercentage : initialData?.lppmFeePercentage ?? 10}
                                            />
                                            <span className="text-sm font-medium">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Share untuk Validasi Sertifikat.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2 pt-2 border-t">
                            <Label>Template Sertifikat</Label>
                            <Select name="certificateTemplateId" defaultValue={state?.payload?.certificateTemplateId || initialData?.certificateTemplateId || "default"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default System</SelectItem>
                                    {templates?.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name} {t.isDefault ? "(Default)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Template yang akan digunakan untuk sertifikat kelulusan lab ini.</p>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Konfigurasi Penilaian (Grading System)</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Atur persentase bobot tiap tipe modul untuk perhitungan nilai akhir kelulusan mahasiswa (skala 0 - 100).
                                    </p>
                                </div>
                                {gradingInput.trim() && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setGradingInput("")}
                                        className="text-xs text-muted-foreground hover:text-red-500 h-7"
                                    >
                                        <RotateCcw className="h-3 w-3 mr-1" /> Reset / Default
                                    </Button>
                                )}
                            </div>

                            {/* Petunjuk & Panduan Singkat */}
                            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-2.5">
                                <div className="flex items-center gap-1.5 font-semibold text-blue-950 dark:text-blue-200">
                                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>Panduan Penentuan Bobot Nilai:</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-1 leading-relaxed">
                                    <li>Kunci modul yang didukung: <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">QUIZ</code>, <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">SIMULATION</code>, <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">INTERACTIVE_VIDEO</code>, <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">VIDEO</code>, <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">DOCUMENT</code>.</li>
                                    <li>Total bobot yang ideal adalah <strong>100%</strong> (misal: Quiz 40% + Simulasi 60% = 100%).</li>
                                    <li><em>Catatan:</em> Jika kolom dikosongkan, sistem secara otomatis akan membagi nilai rata-rata sama rata ke seluruh kuis & tugas di lab ini.</li>
                                </ul>

                                {/* Template Cepat (Presets) */}
                                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 mt-2">
                                    <div className="flex items-center gap-1.5 font-medium mb-1.5 text-blue-950 dark:text-blue-200">
                                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Gunakan Template Cepat (1-Klik):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GRADING_PRESETS.map((preset, idx) => (
                                            <Button
                                                key={idx}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 py-0 px-2.5 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                                onClick={() => setGradingInput(preset.json)}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* JSON Editor & Live Status */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="grading" className="text-xs font-medium flex items-center gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" /> JSON Bobot Penilaian
                                    </Label>
                                    {/* Live Status Badge */}
                                    {gradingInput.trim() ? (
                                        gradingParseError ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full font-medium border border-red-200 dark:border-red-900">
                                                <AlertCircle className="h-3 w-3" /> {gradingParseError}
                                            </span>
                                        ) : totalWeight === 100 ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 px-2.5 py-0.5 rounded-full font-semibold border border-green-200 dark:border-green-900">
                                                <CheckCircle2 className="h-3 w-3" /> Format Valid • Total Bobot: 100%
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full font-medium border border-amber-200 dark:border-amber-900">
                                                <AlertCircle className="h-3 w-3" /> Format Valid • Total: {totalWeight}% (Disarankan: 100%)
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border">
                                            Default (Rata-rata otomatis)
                                        </span>
                                    )}
                                </div>

                                <Textarea
                                    id="grading"
                                    name="grading"
                                    value={gradingInput}
                                    onChange={(e) => setGradingInput(e.target.value)}
                                    className="font-mono text-xs"
                                    rows={5}
                                    placeholder='{\n  "QUIZ": 40,\n  "SIMULATION": 50,\n  "VIDEO": 10\n}'
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 pt-2">
                            <Label>Media / Thumbnail (Optional)</Label>
                            <Input type="file" name="thumbnail" className="cursor-pointer" accept="image/*" />
                            <p className="text-xs text-muted-foreground">Format: JPG, PNG. Max 5MB.</p>
                        </div>

                        {state?.message && <p className="text-sm text-red-500 font-medium">{state.message}</p>}

                        <div className="flex justify-end pt-4">
                            <SubmitButton isEdit={isEdit} />
                        </div>
                    </form >
                </CardContent >
            </Card >
        </div >
    );
}
