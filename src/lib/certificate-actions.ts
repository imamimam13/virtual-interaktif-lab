"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TemplateSchema = z.object({
    name: z.string().min(3),
    html: z.string().min(10),
    css: z.string(),
    isDefault: z.boolean().optional(),
});

export async function createTemplate(prevState: any, formData: FormData) {
    const validated = TemplateSchema.safeParse({
        name: formData.get("name"),
        html: formData.get("html"),
        css: formData.get("css"),
        isDefault: formData.get("isDefault") === "on",
    });

    if (!validated.success) {
        return { message: "Invalid data" };
    }

    try {
        if (validated.data.isDefault) {
            // Unset other defaults
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        await prisma.certificateTemplate.create({
            data: {
                name: validated.data.name,
                html: validated.data.html,
                css: validated.data.css,
                isDefault: validated.data.isDefault || false,
            }
        });

        revalidatePath("/admin/certificate-templates");
        return { message: "Template created successfully" };
    } catch (e) {
        return { message: "Failed to create template" };
    }
}

export async function updateTemplate(id: string, prevState: any, formData: FormData) {
    const validated = TemplateSchema.safeParse({
        name: formData.get("name"),
        html: formData.get("html"),
        css: formData.get("css"),
        isDefault: formData.get("isDefault") === "on",
    });

    if (!validated.success) {
        return { message: "Invalid data" };
    }

    try {
        if (validated.data.isDefault) {
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false }
            });
        }

        await prisma.certificateTemplate.update({
            where: { id },
            data: {
                name: validated.data.name,
                html: validated.data.html,
                css: validated.data.css,
                isDefault: validated.data.isDefault || false,
            }
        });

        revalidatePath("/admin/certificate-templates");
        return { message: "Template updated successfully" };
    } catch (e) {
        return { message: "Failed to update template" };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await prisma.certificateTemplate.delete({ where: { id } });
        revalidatePath("/admin/certificate-templates");
        return { message: "Deleted successfully" };
    } catch (e) {
        return { message: "Failed to delete" };
    }
}
