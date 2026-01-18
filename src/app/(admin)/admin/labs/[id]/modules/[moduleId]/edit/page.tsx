import { prisma } from "@/lib/prisma";
import EditModuleForm from "./edit-form";

export default async function EditModulePage({ params }: { params: Promise<{ id: string, moduleId: string }> }) {
    const { id: labId, moduleId } = await params;

    const module = await prisma.module.findUnique({
        where: { id: moduleId }
    });

    if (!module) {
        return <div>Module not found</div>;
    }

    return <EditModuleForm labId={labId} module={module} />;
}
