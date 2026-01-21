"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateEnrollmentStatus } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export default function VerifyButton({ enrollmentId }: { enrollmentId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAction = async (status: "PAID" | "REJECTED") => {
        if (!confirm(status === "PAID" ? "Setujui pembayaran ini?" : "Tolak pembayaran ini?")) return;

        setIsLoading(true);
        try {
            await updateEnrollmentStatus(enrollmentId, status);
            router.refresh();
        } catch (error) {
            alert("Gagal memperbarui status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleAction("PAID")} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction("REJECTED")} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            </Button>
        </div>
    );
}
