"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SettingsForm({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setIsLoading(false);
        alert("Settings updated! (Simulation)");
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Profil Pengguna</CardTitle>
                    <CardDescription>Update informasi akun anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input defaultValue={user.name} placeholder="Nama anda" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Password Baru</Label>
                        <Input type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
