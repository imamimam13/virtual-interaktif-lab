import { prisma } from "@/lib/prisma";
import CreateLabForm from "./form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CreateLabPage() {
    // Fetch departments from DB for the dropdown
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    const templates = await prisma.certificateTemplate.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, isDefault: true }
    });

    const session = await getServerSession(authOptions);
    const role = session?.user?.role || "LECTURER";

    return <CreateLabForm departments={departments} templates={templates} role={role} />;
}
