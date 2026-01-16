"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { enrollLab } from "@/lib/student-actions";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ labId }: { labId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEnroll = async () => {
        setIsLoading(true);
        try {
            const res = await enrollLab(labId);
            if (res.message === "Success") {
                router.refresh(); // Refresh to show unlocked content
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
        <Button onClick={handleEnroll} disabled={isLoading} size="lg" className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Mulai Belajar (Enroll)
        </Button>
    );
}
