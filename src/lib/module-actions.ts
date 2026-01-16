"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateModuleSchema = z.object({
    title: z.string().min(3),
    type: z.enum(["VIDEO", "PDF", "QUIZ"]),
    content: z.string().min(1), // JSON string or URL
    labId: z.string(),
});

export async function createModule(prevState: any, formData: FormData) {
    const validated = CreateModuleSchema.safeParse({
        title: formData.get("title"),
        type: formData.get("type"),
        content: formData.get("content"),
        labId: formData.get("labId"),
    });

    if (!validated.success) {
        return { message: "Invalid module data" };
    }

    try {
        // Get max order
        const lastModule = await prisma.module.findFirst({
            where: { labId: validated.data.labId },
            orderBy: { order: 'desc' }
        });
        const nextOrder = (lastModule?.order ?? 0) + 1;

        await prisma.module.create({
            data: {
                ...validated.data,
                order: nextOrder
            }
        });

        revalidatePath(`/admin/labs/${validated.data.labId}/modules`);
        return { message: "Module created successfully" };
    } catch (e) {
        return { message: "Failed to create module" };
    }
}

export async function deleteModule(id: string, labId: string) {
    try {
        await prisma.module.delete({ where: { id } });
        revalidatePath(`/admin/labs/${labId}/modules`);
        return { message: "Module deleted" };
    } catch (error) {
        return { message: "Failed to delete module" };
    }
}
