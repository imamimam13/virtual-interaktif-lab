"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createLevelTitle } from "@/lib/gamification-actions";
import { useActionState } from "react";

// Initial state for the form
const initialState = {
    message: ""
};

export default function GamificationForm() {
    const [state, formAction, isPending] = useActionState(createLevelTitle, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input id="level" name="level" type="number" min="1" placeholder="Ex: 5" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="title">Title Name</Label>
                <Input id="title" name="title" placeholder="Ex: Research Assistant" required />
            </div>

            {state?.message && (
                <p className={`text-sm ${state.message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                    {state.message}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Simpan Title
            </Button>
        </form>
    );
}
