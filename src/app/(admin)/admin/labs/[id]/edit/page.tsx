import { prisma } from "@/lib/prisma";
import LabForm from "@/app/(admin)/admin/labs/create/form";
import { notFound } from "next/navigation";

export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lab = await prisma.lab.findUnique({
        where: { id },
    });

    if (!lab) {
        notFound();
    }

    const departments = await prisma.department.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    const templates = await prisma.certificateTemplate.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, isDefault: true }
    });

    return <LabForm departments={departments} templates={templates} initialData={lab} />;
}
