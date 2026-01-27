import { prisma } from "@/lib/prisma";
import PublicModuleViewer from "@/components/modules/public-module-viewer";
import { notFound } from "next/navigation";

export default async function DemoModulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const currentModule = await prisma.module.findUnique({
        where: { id },
        include: { lab: true }
    });

    // Ensure module exists and belongs to a public lab
    if (!currentModule || !currentModule.lab.isPublic) {
        notFound();
    }

    const allModules = await prisma.module.findMany({
        where: { labId: currentModule.labId },
        orderBy: { order: 'asc' }
    });

    // Mock completed status as false, as public users have no progress
    const modulesWithMockProgress = allModules.map((m: any) => ({
        ...m,
        completed: false
    }));

    const validTypeModule = {
        ...currentModule,
        type: currentModule.type as "VIDEO" | "PDF" | "QUIZ" | "SIMULATION" | "INTERACTIVE_VIDEO",
        completed: false
    };

    return (
        <PublicModuleViewer
            currentModule={validTypeModule}
            allModules={modulesWithMockProgress}
            labId={currentModule.labId}
        />
    );
}
