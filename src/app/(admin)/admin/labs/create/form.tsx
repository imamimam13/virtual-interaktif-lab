"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2 } from "lucide-react";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createLab, updateLab, LabFormState } from "@/lib/admin-actions";

type Department = {
    id: string;
    name: string;
};

type LabData = {
    id: string;
    title: string;
    description: string;
    departmentId: string | null;
    thumbnail: string | null;
    instructor: string | null;
    grading: string | null;
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

export default function LabForm({ departments, initialData }: { departments: Department[], initialData?: LabData }) {
    const isEdit = !!initialData;
    const [isIndependent, setIsIndependent] = useState(initialData ? !initialData.departmentId : false);

    // State for form validation
    const initialState: LabFormState = { message: null, errors: {}, payload: null };
    // Choose action based on mode
    const action = isEdit ? updateLab : createLab;
    const [state, dispatch] = useActionState(action, initialState);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{isEdit ? "Edit Laboratorium" : "Buat Laboratorium Baru"}</h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Perbarui informasi laboratorium." : "Tambahkan modul praktikum virtual baru ke sistem."}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Lab</CardTitle>
                    <CardDescription>Detail dasar laboratorium yang akan ditampilkan kepada mahasiswa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        {isEdit && <input type="hidden" name="id" value={initialData.id} />}

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
                            <Label htmlFor="instructor">Nama Dosen / Instruktur</Label>
                            <Input
                                id="instructor"
                                name="instructor"
                                placeholder="Contoh: Dr. Budi Santoso"
                                defaultValue={state?.payload?.instructor || initialData?.instructor || ""}
                            />
                            <p className="text-xs text-muted-foreground">Nama dosen yang bertanggung jawab (Dapat diisi meskipun dibuat oleh admin).</p>
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

                        <div className="space-y-2 border-t pt-4">
                            <Label>Konfigurasi Penilaian (Grading System)</Label>
                            <div className="grid gap-2">
                                <Label htmlFor="grading" className="text-xs font-normal">JSON Formatter (Bobot Penilaian)</Label>
                                <Textarea
                                    id="grading"
                                    name="grading"
                                    className="font-mono text-xs"
                                    rows={5}
                                    placeholder='{ "VIDEO": 10, "QUIZ": 40, "SIMULATION": 50 }'
                                    defaultValue={state?.payload?.grading || initialData?.grading || ""}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tentukan bobot dalam format JSON. Total bobot bisa disesuaikan.
                                </p>
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
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
