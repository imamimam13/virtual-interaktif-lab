"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTemplate } from "@/lib/certificate-actions";
import { useState } from "react";

export default function DeleteTemplateButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;

        setIsDeleting(true);
        try {
            await deleteTemplate(id);
        } catch (e) {
            console.error(e);
            alert("Gagal menghapus template");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
