"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CreditCard } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast"; // Removed: Missing component
import { enrollLab } from "@/lib/student-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    labId: string;
    labTitle: string;
    price: number;
    bankDetails: string;
}

export default function PaymentModal({ isOpen, onClose, labId, labTitle, price, bankDetails }: PaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUploadAndEnroll = async () => {
        if (!file) return;

        setIsLoading(true);
        try {
            // 1. Upload logic (Simulated for now, normally upload to S3/Cloudinary/Blob)
            // Ideally, we'd use a separate upload action or signed URL.
            // For simplicity in this demo, we'll convert to base64 if small, or assume direct upload API.
            // Let's implement a simple Base64 conversion for small proofs (not scalable but works for MVP).
            // BETTER: Use the `smart-pdf-uploader` logic or similar if available.
            // For now, let's use a mock URL or basic Base64 to pass to action.

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                // Note: Heavy payloads might hit server limits. 
                // In production, upload to endpoint -> get URL -> pass URL.

                // Call enrollment with the "proof" (simulating a URL or passing base64)
                // Since this is MVP Manual Verification, let's pass the base64 string directly 
                // if it's reasonable size, or just a filename if we are just testing the flow.
                // REVISION: Without a real upload endpoint, we can't persist files easily.
                // Let's assume we have an upload endpoint. 
                // I will modify this to just simulate sucess if user attaches a file.

                const res = await enrollLab(labId, base64); // Passing base64 as proof

                if (res.message === "Success") {
                    onClose();
                    router.refresh();
                    alert("Pendaftaran berhasil & Bukti pembayaran dikirim. Menunggu verifikasi Admin.");
                } else {
                    alert(res.message);
                }
                setIsLoading(false);
            };

        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan.");
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pembayaran Lab</DialogTitle>
                    <DialogDescription>
                        Anda mendaftar ke kelas berbayar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between font-medium">
                            <span>Lab:</span>
                            <span>{labTitle}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-primary">
                            <span>Total Tagihan:</span>
                            <span>Rp {price.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Instruksi Transfer
                        </Label>
                        <div className="p-3 border rounded text-sm font-mono bg-white dark:bg-black">
                            {bankDetails || "Hubungi Admin untuk Info Rekening"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Silakan transfer sesuai nominal, lalu upload bukti screenshot di bawah ini.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Upload Bukti Transfer</Label>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                        {preview && (
                            <div className="relative aspect-video w-full rounded-md overflow-hidden border mt-2">
                                <Image src={preview} alt="Proof" fill className="object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
                    <Button onClick={handleUploadAndEnroll} disabled={!file || isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Kirim Bukti & Daftar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
