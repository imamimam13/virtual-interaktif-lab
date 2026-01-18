"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLab } from "@/lib/admin-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteLabButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm("Apakah Anda yakin ingin menghapus laboratorium ini?")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteLab(id);
            if (result.message.includes("successfully") || result.message.includes("deleted")) {
                toast.success("Laboratorium berhasil dihapus");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <form onSubmit={handleDelete}>
            <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={isPending}
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </form>
    );
}
