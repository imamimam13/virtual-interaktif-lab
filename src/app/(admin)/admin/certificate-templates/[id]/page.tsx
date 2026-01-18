import { prisma } from "@/lib/prisma";
import TemplateEditor from "../editor";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const template = await prisma.certificateTemplate.findUnique({
        where: { id }
    });

    if (!template) notFound();

    return <TemplateEditor template={template} />;
}
