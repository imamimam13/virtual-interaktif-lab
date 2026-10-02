import { prisma } from "@/lib/prisma";
import CreateLabForm from "./form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemConfig } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateLabPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/login");

    // Fetch departments from DB for the dropdown
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    const templates = await prisma.certificateTemplate.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, isDefault: true }
    });

    const role = session.user.role || "LECTURER";
    const currentUserName = session.user.name || session.user.email || "Dosen Pengampu";

    const defaultDosenFee = parseInt((await getSystemConfig("DEFAULT_DOSEN_FEE")) || "50");
    const defaultLppmFee = parseInt((await getSystemConfig("DEFAULT_LPPM_FEE")) || "10");

    return (
        <CreateLabForm
            departments={departments}
            templates={templates}
            role={role}
            currentUserName={currentUserName}
            defaultDosenFee={defaultDosenFee}
            defaultLppmFee={defaultLppmFee}
        />
    );
}
