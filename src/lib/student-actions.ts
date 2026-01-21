"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function enrollLab(labId: string, paymentProof?: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return { message: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { message: "User not found" };
    }

    // Uniqueness check (already covered by db constraint, but good for message)
    const existing = await prisma.enrollment.findUnique({
        where: {
            userId_labId: {
                userId: user.id,
                labId: labId
            }
        }
    });

    if (existing) {
        return { message: "Already enrolled" };
    }

    try {
        const lab = await prisma.lab.findUnique({ where: { id: labId } });
        if (!lab) return { message: "Lab not found" };

        const price = lab.price || 0;
        let status = "ACTIVE";
        let paymentStatus = "PAID";
        let instructorShare = 0;
        let lppmShare = 0;
        let platformShare = 0;

        if (price > 0) {
            status = "PENDING"; // Wait for approval
            paymentStatus = "PENDING";

            if (!paymentProof) {
                return { message: "Payment proof is required for paid labs" };
            }

            // Calculate Shares
            instructorShare = Math.floor(price * (lab.feePercentage / 100));
            lppmShare = Math.floor(price * (lab.lppmFeePercentage / 100));
            platformShare = price - instructorShare - lppmShare;
        }

        await prisma.enrollment.create({
            data: {
                userId: user.id,
                labId: labId,
                status,
                paymentStatus,
                paymentProof: paymentProof || null,
                instructorShare,
                lppmShare,
                platformShare
            }
        });

        revalidatePath(`/dashboard/labs/${labId}`);
        revalidatePath("/dashboard");
        return { message: "Success" };
    } catch (error) {
        console.error(error);
        return { message: "Failed to enroll" };
    }
}
