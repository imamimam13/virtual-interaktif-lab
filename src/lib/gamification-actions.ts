"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LevelTitleSchema = z.object({
    level: z.coerce.number().min(1),
    title: z.string().min(3),
    minXp: z.coerce.number().min(0),
});

export async function createLevelTitle(prevState: any, formData: FormData) {
    const validated = LevelTitleSchema.safeParse({
        level: formData.get("level"),
        title: formData.get("title"),
        minXp: formData.get("minXp"),
    });

    if (!validated.success) {
        return { message: "Invalid data: Check inputs" };
    }

    try {
        await (prisma as any).levelTitle.upsert({
            where: { level: validated.data.level },
            update: {
                title: validated.data.title,
                minXp: validated.data.minXp
            },
            create: {
                level: validated.data.level,
                title: validated.data.title,
                minXp: validated.data.minXp
            }
        });

        revalidatePath("/admin/gamification");
        return { message: "Level Title saved successfully" };
    } catch (e) {
        return { message: "Failed to save Level Title" };
    }
}

export async function deleteLevelTitle(level: number) {
    try {
        await (prisma as any).levelTitle.delete({ where: { level } });
        revalidatePath("/admin/gamification");
        return { message: "Deleted successfully" };
    } catch (e) {
        return { message: "Failed to delete" };
    }
}
