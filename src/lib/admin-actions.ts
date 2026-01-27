"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const CreateLabSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    departmentId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    certificateTemplateId: z.string().optional().nullable().transform(val => val === "" ? null : val),
    isIndependent: z.coerce.boolean(),
    isPublic: z.coerce.boolean(),
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
        isPublic?: string[];
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
        certificateTemplateId?: string | null;
        isIndependent: File | string | null;
        isPublic: File | string | null;
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
        certificateTemplateId: formData.get("certificateTemplateId") === "default" ? null : formData.get("certificateTemplateId") as string,
        isIndependent: formData.get("isIndependent"),
        isPublic: formData.get("isPublic"),
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
        isPublic: rawData.isPublic,
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
        title, description, departmentId, certificateTemplateId, isIndependent, isPublic, instructor, grading,
        price, feePercentage, lppmFeePercentage, bankDetails
    } = validatedFields.data;

    const session = await getServerSession(authOptions);
    const role = session?.user?.role || "LECTURER"; // Default to safest role

    let finalPrice = price;
    let finalRequestedPrice = 0;
    let finalFee = feePercentage;
    let finalLppmFee = lppmFeePercentage;

    if (role === "LECTURER") {
        // Enforce rules for Lecturers
        finalRequestedPrice = price; // Store requested price
        finalPrice = 0; // Force Free until approved

        // Fetch System Defaults
        const systemDosenFee = await getSystemConfig("DEFAULT_DOSEN_FEE");
        const systemLppmFee = await getSystemConfig("DEFAULT_LPPM_FEE");

        finalFee = systemDosenFee ? parseInt(systemDosenFee) : 50;
        finalLppmFee = systemLppmFee ? parseInt(systemLppmFee) : 10;
    }

    try {
        await prisma.lab.create({
            data: {
                title,
                description,
                departmentId: isIndependent ? null : departmentId,
                isPublic,
                certificateTemplateId: certificateTemplateId || null,
                thumbnail: "/images/placeholders/lab-default.jpg",
                instructor,
                grading,
                price: finalPrice,
                requestedPrice: finalRequestedPrice,
                feePercentage: finalFee,
                lppmFeePercentage: finalLppmFee,
                bankDetails
            } as any,
        });
    } catch (error) {
        console.error("Database Error FULL:", error);
        // Try to verify if it's a specific Prisma error
        if ((error as any).code === 'P2002') {
            return { message: "Failed: A lab with this title already exists." };
        }
        return {
            message: `Database Error: ${(error as any).message || "Failed to Create Lab."}`,
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
        certificateTemplateId: formData.get("certificateTemplateId") === "default" ? null : formData.get("certificateTemplateId") as string,
        isIndependent: formData.get("isIndependent"),
        isPublic: formData.get("isPublic"),
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
        isPublic: rawData.isPublic,
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
        title, description, departmentId, certificateTemplateId, isIndependent, isPublic, instructor, grading,
        price, feePercentage, lppmFeePercentage, bankDetails
    } = validatedFields.data;

    const session = await getServerSession(authOptions);
    const role = session?.user?.role || "LECTURER";

    let finalPrice = price;
    let finalRequestedPrice = undefined; // Undefined means don't touch unless needed
    let finalFee = feePercentage;
    let finalLppmFee = lppmFeePercentage;

    if (role === "LECTURER") {
        // If Lecturer edits, we must re-evaluate Price
        if (price > 0) {
            finalRequestedPrice = price;
            finalPrice = 0; // Reset to Free -> Waiting Approval
        } else {
            // If they set 0, they mean Free.
            finalRequestedPrice = 0;
            finalPrice = 0;
        }

        // Lecturers cannot change fees
        const systemDosenFee = await getSystemConfig("DEFAULT_DOSEN_FEE");
        const systemLppmFee = await getSystemConfig("DEFAULT_LPPM_FEE");

        finalFee = systemDosenFee ? parseInt(systemDosenFee) : 50;
        finalLppmFee = systemLppmFee ? parseInt(systemLppmFee) : 10;
    } else {
        // Admin edits:
        // If Admin sets a price, we assume it's approved.
        // We can clear requestedPrice if they set a real Price.
        if (price > 0) {
            finalRequestedPrice = 0;
        }
    }

    // Determine data object to update (handle undefined requestedPrice)
    const updateData: any = {
        title,
        description,
        departmentId: isIndependent ? null : departmentId,
        isPublic,
        certificateTemplateId: certificateTemplateId || null,
        instructor,
        grading,
        price: finalPrice,
        feePercentage: finalFee,
        lppmFeePercentage: finalLppmFee,
        bankDetails
    };

    if (finalRequestedPrice !== undefined) {
        updateData.requestedPrice = finalRequestedPrice;
    }

    try {
        await prisma.lab.update({
            where: { id: rawData.id },
            data: updateData,
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

export async function approveLab(labId: string, price: number, feePercentage: number, lppmFeePercentage: number) {
    try {
        await prisma.lab.update({
            where: { id: labId },
            data: {
                price,
                feePercentage,
                lppmFeePercentage,
                requestedPrice: 0 // Clear the request
            }
        });
        revalidatePath("/admin/labs");
        return { message: "Lab approved successfully" };
    } catch (error) {
        return { message: "Failed to approve lab" };
    }
}

export async function rejectLab(labId: string) {
    try {
        await prisma.lab.update({
            where: { id: labId },
            data: {
                requestedPrice: 0 // Clear the request, keeping price 0 (Free)
            }
        });
        revalidatePath("/admin/labs");
        return { message: "Lab price request rejected" };
    } catch (error) {
        return { message: "Failed to reject lab" };
    }
}

export async function getSystemConfig(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
        where: { key }
    });
    return config?.value || null;
}

export async function updateSystemConfig(key: string, value: string) {
    try {
        await prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        revalidatePath("/admin/settings");
        return { message: "Configuration updated" };
    } catch (error) {
        return { message: "Failed to update configuration" };
    }
}
