"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateModuleSchema = z.object({
    title: z.string().min(3),
    type: z.enum(["VIDEO", "PDF", "QUIZ", "SIMULATION", "INTERACTIVE_VIDEO"]),
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

export async function updateModule(moduleId: string, prevState: any, formData: FormData) {
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
        await prisma.module.update({
            where: { id: moduleId },
            data: {
                title: validated.data.title,
                type: validated.data.type,
                content: validated.data.content,
            }
        });

        revalidatePath(`/admin/labs/${validated.data.labId}/modules`);
        revalidatePath(`/dashboard/module/${moduleId}`);
        return { message: "Module updated successfully" };
    } catch (e) {
        return { message: "Failed to update module" };
    }
}

export async function createModuleFromPdf(labId: string, fileUrl: string, fileName: string) {
    try {
        // Get max order
        const lastModule = await prisma.module.findFirst({
            where: { labId },
            orderBy: { order: 'desc' }
        });
        const nextOrder = (lastModule?.order ?? 0) + 1;

        await prisma.module.create({
            data: {
                title: fileName,
                type: "PDF",
                content: fileUrl,
                labId: labId,
                order: nextOrder
            }
        });

        revalidatePath(`/admin/labs/${labId}/modules`);
        return { success: true };
    } catch (error) {
        console.error("Error creating module from PDF:", error);
        return { success: false, error: "Failed to create module database entry" };
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

export async function markModuleComplete(moduleId: string, userId: string, score: number = 0) {
    try {
        await prisma.moduleProgress.upsert({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId
                }
            },
            update: {
                completed: true,
                score: score > 0 ? score : undefined
            },
            create: {
                userId,
                moduleId,
                completed: true,
                score: score > 0 ? score : undefined
            }
        });

        revalidatePath(`/dashboard/module/${moduleId}`);

        // Check for Lab Completion & Generate Certificate
        const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { lab: true } });
        if (module) {
            const labId = module.labId;
            const totalModules = await prisma.module.count({ where: { labId } });
            const completedModules = await prisma.moduleProgress.count({
                where: {
                    userId,
                    module: { labId },
                    completed: true
                }
            });

            if (completedModules === totalModules) {
                const existingCert = await prisma.certificate.findUnique({
                    where: { userId_labId: { userId, labId } }
                });

                if (!existingCert) {
                    const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    await prisma.certificate.create({
                        data: {
                            userId,
                            labId,
                            labTitle: module.lab.title,
                            code
                        }
                    });
                }
            }
        }

        return { success: true };
    } catch (e) {
        console.error("Error marking module complete:", e);
        return { success: false };
    }
}
