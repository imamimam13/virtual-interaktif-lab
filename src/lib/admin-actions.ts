"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const CreateLabSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    departmentId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    certificateTemplateId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    isIndependent: z.coerce.boolean(),
    instructor: z.string().optional(),
    grading: z.string().optional(), // JSON
    price: z.coerce.number().min(0, "Price must be non-negative"),
    feePercentage: z.coerce.number().min(0).max(100, "Percentage must be 0-100"),
    lppmFeePercentage: z.coerce.number().min(0).max(100, "Percentage must be 0-100"),
    bankDetails: z.string().optional(),
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
        price?: string[];
        feePercentage?: string[];
        lppmFeePercentage?: string[];
        bankDetails?: string[];
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
        price?: string;
        feePercentage?: string;
        lppmFeePercentage?: string;
        bankDetails?: string;
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
        price: formData.get("price") as string,
        feePercentage: formData.get("feePercentage") as string,
        lppmFeePercentage: formData.get("lppmFeePercentage") as string,
        bankDetails: formData.get("bankDetails") as string,
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
        price: rawData.price,
        feePercentage: rawData.feePercentage,
        lppmFeePercentage: rawData.lppmFeePercentage,
        bankDetails: rawData.bankDetails,
    });

    if (!validatedFields.success) {
        console.log("Validation Errors:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Lab.",
            payload: rawData,
        };
    }

    const {
        title, description, departmentId, certificateTemplateId, isIndependent, instructor, grading,
        price, feePercentage, lppmFeePercentage, bankDetails
    } = validatedFields.data;

    try {
        await prisma.lab.create({
            data: {
                title,
                description,
                departmentId: isIndependent ? null : departmentId,
                certificateTemplateId: certificateTemplateId || null,
                thumbnail: "/images/placeholders/lab-default.jpg",
                instructor,
                grading,
                price,
                feePercentage,
                lppmFeePercentage,
                bankDetails
            } as any,
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
        price: formData.get("price") as string,
        feePercentage: formData.get("feePercentage") as string,
        lppmFeePercentage: formData.get("lppmFeePercentage") as string,
        bankDetails: formData.get("bankDetails") as string,
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
        price: rawData.price,
        feePercentage: rawData.feePercentage,
        lppmFeePercentage: rawData.lppmFeePercentage,
        bankDetails: rawData.bankDetails,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Lab.",
            payload: rawData as any,
        };
    }

    const {
        title, description, departmentId, certificateTemplateId, isIndependent, instructor, grading,
        price, feePercentage, lppmFeePercentage, bankDetails
    } = validatedFields.data;

    try {
        await prisma.lab.update({
            where: { id: rawData.id },
            data: {
                title,
                description,
                departmentId: isIndependent ? null : departmentId,
                certificateTemplateId: certificateTemplateId || null,
                instructor,
                grading,
                price,
                feePercentage,
                lppmFeePercentage,
                bankDetails
            } as any,
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

export async function resetPassword(id: string, newPassword: string) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        revalidatePath("/admin/users");
        return { message: "Password updated successfully" };
    } catch (error) {
        return { message: "Failed to update password" };
    }
}

export async function updateUser(id: string, data: { name: string; email: string; role: string }) {
    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role as any
            }
        });
        revalidatePath("/admin/users");
        return { message: "User updated successfully" };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { message: "Failed to update user" };
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

    // Hash password
    const plainPassword = validated.data.password || "defaultPassword123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

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
        revalidatePath("/admin/users");
        return { message: "User created successfully" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to create user. Email might be in use." };
    }
}

export async function updateEnrollmentStatus(id: string, paymentStatus: "PAID" | "REJECTED") {
    try {
        const updateData: any = { paymentStatus };

        // If Approved, Activate Access
        if (paymentStatus === "PAID") {
            updateData.status = "ACTIVE";
        } else if (paymentStatus === "REJECTED") {
            updateData.status = "REJECTED"; // Or keep PENDING/BLOCKED
        }

        await prisma.enrollment.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/enrollments");
        return { message: "Status updated" };
    } catch (error) {
        return { message: "Failed to update status" };
    }
}
