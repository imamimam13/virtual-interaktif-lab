import { prisma } from "@/lib/prisma";
import ModuleViewer from "@/components/modules/module-viewer";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
    const { moduleId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    // Get currentUser
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) redirect("/auth/login");

    const currentModule = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { lab: true }
    });

    if (!currentModule) notFound();

    // Fetch all modules in this lab to calculate next/prev
    // Fetch all modules in this lab to calculate next/prev
    const allModules = await prisma.module.findMany({
        where: { labId: currentModule.labId },
        orderBy: { order: 'asc' }
    });

    // Fetch User Progress for these modules
    const userProgress = await prisma.moduleProgress.findMany({
        where: {
            userId: user.id,
            moduleId: { in: allModules.map(m => m.id) }
        }
    });

    const progressMap = new Map(userProgress.map(p => [p.moduleId, p.completed]));

    const modulesWithProgress = allModules.map((m: any) => ({
        ...m,
        completed: progressMap.get(m.id) || false
    }));

    // Convert generic type to specific union
    const validTypeModule = {
        ...currentModule,
        type: currentModule.type as "VIDEO" | "PDF" | "QUIZ" | "SIMULATION" | "INTERACTIVE_VIDEO",
        completed: progressMap.get(currentModule.id) || false
    };

    return (
        <ModuleViewer
            currentModule={validTypeModule}
            allModules={modulesWithProgress}
            labId={currentModule.labId}
            userId={user.id}
        />
    );
}
