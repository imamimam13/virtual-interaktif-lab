"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function enrollLab(labId: string) {
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

    try {
        await prisma.enrollment.create({
            data: {
                userId: user.id,
                labId: labId,
                status: "ACTIVE"
            }
        });

        revalidatePath(`/dashboard/labs/${labId}`);
        revalidatePath("/dashboard");
        return { message: "Success" };
    } catch (error) {
        return { message: "Already enrolled or failed" };
    }
}
