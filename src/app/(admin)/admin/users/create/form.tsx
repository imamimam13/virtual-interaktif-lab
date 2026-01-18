"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createUser } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type Department = {
    id: string;
    name: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending} type="submit" className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan User
        </Button>
    );
}

export default function UserForm({ departments }: { departments: Department[] }) {
    const initialState = { message: "", errors: {}, payload: null };
    // @ts-ignore - useActionState type definitions can be strict with initial state
    const [state, dispatch] = useActionState(createUser, initialState);

    return (
        <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6">
                <form action={dispatch} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Nama Lengkap</Label>
                        <Input name="name" placeholder="John Doe" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Password</Label>
                        <Input name="password" type="password" placeholder="******" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select name="role" defaultValue="STUDENT">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Mahasiswa</SelectItem>
                                <SelectItem value="LECTURER">Dosen</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Program Studi (Department)</Label>
                        <Select name="departmentId">
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
                        <p className="text-xs text-muted-foreground">Wajib untuk Mahasiswa agar hanya melihat lab prodi ini.</p>
                    </div>

                    {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
