"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateLabSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    departmentId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    certificateTemplateId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    isIndependent: z.coerce.boolean(),
    instructor: z.string().optional(),
    grading: z.string().optional(), // JSON
});

export type LabFormState = {
    errors?: {
        title?: string[];
        description?: string[];
        departmentId?: string[];
        certificateTemplateId?: string[];
        isIndependent?: string[];
        instructor?: string[];
        grading?: string[];
    };
    message?: string | null;
    payload?: {
        title: string;
        description: string;
        departmentId: string;
        certificateTemplateId?: string;
        isIndependent: File | string | null;
        instructor?: string;
        grading?: string;
    } | null;
};

export async function createLab(prevState: LabFormState, formData: FormData): Promise<LabFormState> {
    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        departmentId: formData.get("departmentId") as string,
        certificateTemplateId: formData.get("certificateTemplateId") as string,
        isIndependent: formData.get("isIndependent"),
        instructor: formData.get("instructor") as string,
        grading: formData.get("grading") as string,
    };

    console.log("createLab Action Received:", rawData);

    const validatedFields = CreateLabSchema.safeParse({
        title: rawData.title,
        description: rawData.description,
        departmentId: rawData.departmentId,
        certificateTemplateId: rawData.certificateTemplateId,
        isIndependent: rawData.isIndependent,
        instructor: rawData.instructor,
        grading: rawData.grading,
    });

    if (!validatedFields.success) {
        console.log("Validation Errors:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Lab.",
            payload: rawData,
        };
    }

    const { title, description, departmentId, certificateTemplateId, isIndependent, instructor, grading } = validatedFields.data;

    try {
        await prisma.lab.create({
            data: {
                title,
                description,
                departmentId: isIndependent ? null : departmentId,
                certificateTemplateId: certificateTemplateId || null,
                thumbnail: "/images/placeholders/lab-default.jpg",
                instructor,
                grading
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Create Lab.",
            payload: rawData,
        };
    }

    revalidatePath("/admin/labs");
    revalidatePath("/dashboard");
    redirect("/admin/labs");
}

export async function updateLab(prevState: LabFormState, formData: FormData): Promise<LabFormState> {
    const rawData = {
        id: formData.get("id") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        departmentId: formData.get("departmentId") as string,
        certificateTemplateId: formData.get("certificateTemplateId") as string,
        isIndependent: formData.get("isIndependent"),
        instructor: formData.get("instructor") as string,
        grading: formData.get("grading") as string,
    };

    console.log("updateLab Action Received:", rawData);

    const validatedFields = CreateLabSchema.safeParse({
        title: rawData.title,
        description: rawData.description,
        departmentId: rawData.departmentId,
        certificateTemplateId: rawData.certificateTemplateId,
        isIndependent: rawData.isIndependent,
        instructor: rawData.instructor,
        grading: rawData.grading,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Lab.",
            payload: rawData as any,
        };
    }

    const { title, description, departmentId, certificateTemplateId, isIndependent, instructor, grading } = validatedFields.data;

    try {
        await prisma.lab.update({
            where: { id: rawData.id },
            data: {
                title,
                description,
                departmentId: isIndependent ? null : departmentId,
                certificateTemplateId: certificateTemplateId || null,
                instructor,
                grading
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Update Lab.",
            payload: rawData as any,
        };
    }

    revalidatePath("/admin/labs");
    revalidatePath("/dashboard");
    redirect("/admin/labs");
}

export async function deleteLab(id: string) {
    try {
        await prisma.lab.delete({ where: { id } });
        revalidatePath("/admin/labs");
        return { message: "Lab deleted successfully" };
    } catch (error) {
        return { message: "Failed to delete lab" };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/admin/users");
        return { message: "User deleted successfully" };
    } catch (error) {
        return { message: "Failed to delete user" };
    }
}

const CreateDepartmentSchema = z.object({
    name: z.string().min(3),
    level: z.string().min(2),
});

export async function createDepartment(prevState: any, formData: FormData) {
    const validated = CreateDepartmentSchema.safeParse({
        name: formData.get("name"),
        level: formData.get("level"),
    });

    if (!validated.success) {
        return { message: "Invalid department data" };
    }

    try {
        await prisma.department.create({
            data: {
                name: `${validated.data.name} (${validated.data.level})`
            }
        });
        revalidatePath("/admin/departments");
        // revalidatePath("/admin/labs/create"); // Refresh dropdown data
        return { message: "Department created" };
    } catch (e) {
        return { message: "Failed to create department" };
    }
}

export async function deleteDepartment(id: string) {
    try {
        await prisma.department.delete({ where: { id } });
        revalidatePath("/admin/departments");
        return { message: "Department deleted" };
    } catch (error) {
        return { message: "Failed to delete department" };
    }
}


const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional().or(z.literal('')),
    name: z.string().min(2),
    role: z.enum(["STUDENT", "LECTURER", "ADMIN"]),
    departmentId: z.string().optional().nullable().transform(val => val === "" ? null : val),
});

export async function createUser(prevState: any, formData: FormData) {
    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
        role: formData.get("role"),
        departmentId: formData.get("departmentId"),
    };

    const validated = CreateUserSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation Error",
            payload: rawData
        };
    }

    // Basic password hashing simulation
    const hashedPassword = validated.data.password || "defaultPassword123";

    try {
        await prisma.user.create({
            data: {
                email: validated.data.email,
                password: hashedPassword,
                name: validated.data.name,
                role: validated.data.role,
                departmentId: validated.data.departmentId,
            }
        });
    } catch (e) {
        console.error(e);
        return { message: "Failed to create user. Email might be in use." };
    }

    revalidatePath("/admin/users");
    redirect("/admin/users");
}
