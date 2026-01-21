"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSystemConfig } from "@/lib/admin-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RevenueConfigFormProps {
    defaultDosenFee: string;
    defaultLppmFee: string;
}

export default function RevenueConfigForm({ defaultDosenFee, defaultLppmFee }: RevenueConfigFormProps) {
    const [dosenFee, setDosenFee] = useState(defaultDosenFee);
    const [lppmFee, setLppmFee] = useState(defaultLppmFee);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSystemConfig("DEFAULT_DOSEN_FEE", dosenFee);
            await updateSystemConfig("DEFAULT_LPPM_FEE", lppmFee);
            toast.success("Konfigurasi revenue berhasil diperbarui");
        } catch (error) {
            toast.error("Gagal menyimpan konfigurasi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Konfigurasi Revenue Default</CardTitle>
                <CardDescription>Atur persentase pembagian hasil default untuk Lab baru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Default Fee Dosen (%)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={dosenFee}
                                onChange={(e) => setDosenFee(e.target.value)}
                                min="0"
                                max="100"
                            />
                            <span className="text-sm font-medium">%</span>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Default Fee LPPM (%)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={lppmFee}
                                onChange={(e) => setLppmFee(e.target.value)}
                                min="0"
                                max="100"
                            />
                            <span className="text-sm font-medium">%</span>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Konfigurasi Revenue
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
