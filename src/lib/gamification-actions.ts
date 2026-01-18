"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LevelTitleSchema = z.object({
    level: z.coerce.number().min(1),
    title: z.string().min(3),
});

export async function createLevelTitle(prevState: any, formData: FormData) {
    const validated = LevelTitleSchema.safeParse({
        level: formData.get("level"),
        title: formData.get("title"),
    });

    if (!validated.success) {
        return { message: "Invalid data: Level must be number, Title min 3 chars" };
    }

    try {
        await prisma.levelTitle.upsert({
            where: { level: validated.data.level },
            update: { title: validated.data.title },
            create: {
                level: validated.data.level,
                title: validated.data.title,
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
        await prisma.levelTitle.delete({ where: { level } });
        revalidatePath("/admin/gamification");
        return { message: "Deleted successfully" };
    } catch (e) {
        return { message: "Failed to delete" };
    }
}
