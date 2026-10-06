import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import GradesClient from "./grades-client";

export const dynamic = "force-dynamic";

export default async function AdminGradesPage({
    searchParams,
}: {
    searchParams: Promise<{ labId?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/auth/login");
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "LECTURER") {
        redirect("/dashboard");
    }

    const isLecturer = session.user.role === "LECTURER";
    const userName = session.user.name?.trim();
    const userEmail = session.user.email?.trim();

    // Lecturer filter
    const labWhereClause = isLecturer
        ? {
            OR: [
                ...(userName ? [{ instructor: userName }] : []),
                ...(userEmail ? [{ instructor: userEmail }] : []),
            ]
          }
        : {};

    // Get all available labs
    const labs = await prisma.lab.findMany({
        where: labWhereClause,
        include: {
            department: true,
            _count: {
                select: {
                    modules: true,
                    enrollments: true,
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const params = await searchParams;
    const requestedLabId = params.labId;

    // Pick target lab
    const selectedLabSummary = requestedLabId
        ? labs.find(l => l.id === requestedLabId) || labs[0]
        : labs[0];

    const labsSummary = labs.map(l => ({
        id: l.id,
        title: l.title,
        instructor: l.instructor,
        departmentName: l.department?.name || null,
        modulesCount: l._count.modules,
        enrollmentsCount: l._count.enrollments,
    }));

    if (!selectedLabSummary) {
        return <GradesClient labs={[]} currentLab={null} students={[]} />;
    }

    // Fetch full lab data with modules
    const currentLab = await prisma.lab.findUnique({
        where: { id: selectedLabSummary.id },
        include: {
            department: true,
            modules: {
                orderBy: { order: "asc" }
            }
        }
    });

    if (!currentLab) {
        return <GradesClient labs={labsSummary} currentLab={null} students={[]} />;
    }

    // Fetch enrollments for the selected lab
    const enrollments = await prisma.enrollment.findMany({
        where: { labId: currentLab.id },
        include: {
            user: {
                include: {
                    department: true
                }
            }
        },
        orderBy: { joinedAt: "desc" }
    });

    // Fetch all module progress for this lab
    const moduleProgressList = await prisma.moduleProgress.findMany({
        where: {
            module: { labId: currentLab.id }
        }
    });

    // Fetch certificates for this lab
    const certificates = await prisma.certificate.findMany({
        where: { labId: currentLab.id }
    });

    const totalModulesCount = currentLab.modules.length;
    const scoredModules = currentLab.modules.filter(m =>
        m.type === "QUIZ" || m.type === "INTERACTIVE_VIDEO" || m.type === "SCORM" || m.type === "HTML"
    );

    // Calculate grades and progress for each student
    const studentsData = enrollments.map(enrollment => {
        const user = enrollment.user;
        const userProgress = moduleProgressList.filter(p => p.userId === user.id);
        const completedCount = userProgress.filter(p => p.completed).length;

        const progressPercentage = totalModulesCount > 0
            ? Math.round((completedCount / totalModulesCount) * 100)
            : 0;

        // Calculate final score
        let finalScore = 0;
        if (scoredModules.length > 0) {
            let sumScores = 0;
            let scoredCount = 0;

            for (const sm of scoredModules) {
                const prog = userProgress.find(p => p.moduleId === sm.id);
                if (prog && prog.score !== null && prog.score !== undefined) {
                    sumScores += prog.score;
                    scoredCount++;
                } else if (prog?.completed) {
                    sumScores += 100;
                    scoredCount++;
                }
            }

            finalScore = scoredCount > 0 ? Math.round(sumScores / scoredModules.length) : 0;
        } else {
            finalScore = progressPercentage;
        }

        // Check certificate
        const cert = certificates.find(c => c.userId === user.id);

        // Map per-module results
        const moduleResults = currentLab.modules.map(mod => {
            const prog = userProgress.find(p => p.moduleId === mod.id);
            return {
                moduleId: mod.id,
                moduleTitle: mod.title,
                moduleType: mod.type,
                completed: prog?.completed || false,
                score: prog?.score ?? null,
                updatedAt: prog?.updatedAt ? prog.updatedAt.toISOString() : null,
            };
        });

        return {
            id: enrollment.id,
            userId: user.id,
            name: user.name || user.email.split("@")[0],
            email: user.email,
            nim: user.nim || null,
            departmentName: user.department?.name || null,
            status: enrollment.status,
            paymentStatus: enrollment.paymentStatus,
            joinedAt: enrollment.joinedAt.toISOString(),
            completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
            progressPercentage,
            completedModulesCount: completedCount,
            finalScore,
            certificateCode: cert?.code || null,
            moduleResults,
        };
    });

    const currentLabData = {
        id: currentLab.id,
        title: currentLab.title,
        instructor: currentLab.instructor,
        departmentName: currentLab.department?.name || null,
        modules: currentLab.modules.map(m => ({
            id: m.id,
            title: m.title,
            type: m.type,
            order: m.order,
        }))
    };

    return (
        <GradesClient
            labs={labsSummary}
            currentLab={currentLabData}
            students={studentsData}
        />
    );
}
