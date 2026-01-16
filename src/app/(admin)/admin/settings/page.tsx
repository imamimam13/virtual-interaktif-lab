import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Pengaturan Platform</h1>
                <p className="text-muted-foreground">Konfigurasi umum aplikasi Virtual Lab.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Universitas</CardTitle>
                        <CardDescription>Informasi dasar identitas kampus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nama Universitas</Label>
                            <Input defaultValue="Universitas Wira Bhakti" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email Support</Label>
                            <Input defaultValue="helpdesk@wirabhakti.ac.id" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sistem & Akses</CardTitle>
                        <CardDescription>Pengaturan pendaftaran dan akses sistem.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div>
                                <Label className="text-base">Registrasi Mahasiswa Baru</Label>
                                <p className="text-sm text-muted-foreground">
                                    Izinkan mahasiswa untuk mendaftar akun baru secara mandiri.
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                            <div>
                                <Label className="text-base">Mode Maintenance</Label>
                                <p className="text-sm text-muted-foreground">
                                    Nonaktifkan akses public sementara untuk perbaikan sistem.
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button>Simpan Perubahan</Button>
                </div>
            </div>
        </div>
    );
}
