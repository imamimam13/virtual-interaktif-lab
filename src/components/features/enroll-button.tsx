"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { enrollLab } from "@/lib/student-actions";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import PaymentModal from "@/components/features/payment-modal";

interface EnrollButtonProps {
    labId: string;
    labTitle: string;
    price?: number;
    bankDetails?: string;
}

export default function EnrollButton({ labId, labTitle, price = 0, bankDetails = "" }: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const router = useRouter();

    const handleEnroll = async () => {
        if (price > 0) {
            setIsPaymentOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await enrollLab(labId);
            if (res.message === "Success") {
                router.refresh();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleEnroll} disabled={isLoading} size="lg" className="w-full md:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {price > 0 ? "Beli Lab (Enroll)" : "Mulai Belajar (Enroll)"}
            </Button>

            {price > 0 && (
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    labId={labId}
                    labTitle={labTitle}
                    price={price}
                    bankDetails={bankDetails}
                />
            )}
        </>
    );
}
