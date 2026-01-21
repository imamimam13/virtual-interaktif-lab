"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- Dosen: Request Payout ---
export async function requestPayout(amount: number, bankDetails: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { message: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: "User not found" };

    // Basic validation
    if (amount <= 0) return { message: "Amount must be greater than 0" };
    if (!bankDetails) return { message: "Bank details required" };

    try {
        await prisma.payout.create({
            data: {
                userId: user.id,
                amount,
                bankDetails,
                status: "PENDING"
            }
        });
        revalidatePath("/admin/revenue");
        return { message: "Payout requested successfully" };
    } catch (error) {
        console.error("Payout Request Error:", error);
        return { message: "Failed to request payout" };
    }
}

// --- Admin: Process Payout (Approve/Reject) ---
export async function approvePayout(payoutId: string, proofUrl?: string, notes?: string) {
    try {
        await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: "PAID",
                proof: proofUrl,
                notes
            }
        });
        revalidatePath("/admin/revenue");
        return { message: "Payout approved" };
    } catch (error) {
        return { message: "Failed to approve payout" };
    }
}

export async function rejectPayout(payoutId: string, reason: string) {
    try {
        await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: "REJECTED",
                notes: reason
            }
        });
        revalidatePath("/admin/revenue");
        return { message: "Payout rejected" };
    } catch (error) {
        return { message: "Failed to reject payout" };
    }
}

// --- Stats & History Fetchers ---
export async function getPayoutHistory() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return [];

    const isLecturer = user.role === "LECTURER";

    const whereCondition = isLecturer ? { userId: user.id } : {}; // Admin sees all? Or user sees theirs?
    // Admin should see ALL requests in a specific tab, but getPayoutHistory might be generic for "My History".
    // Let's make this "My Payout History".

    return await prisma.payout.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" }
    });
}

export async function getPendingPayouts() {
    // Admin ONLY
    return await prisma.payout.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" }
    });
}
