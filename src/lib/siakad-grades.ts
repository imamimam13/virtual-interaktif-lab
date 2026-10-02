import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySiakadApiKey } from "@/lib/siakad-auth";

export async function handleGetLabGrades(req: NextRequest, labIdentifier: string) {
    const authCheck = await verifySiakadApiKey(req);
    if (!authCheck.isValid) {
        return NextResponse.json(
            { success: false, error: authCheck.error || "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Find lab by id or siakadJadwalId
        const lab = await prisma.lab.findFirst({
            where: {
                OR: [
                    { id: labIdentifier },
                    { siakadJadwalId: labIdentifier },
                ]
            },
            include: {
                modules: {
                    orderBy: { order: "asc" }
                }
            }
        });

        if (!lab) {
            return NextResponse.json(
                { success: false, error: `Laboratorium tidak ditemukan untuk ID: ${labIdentifier}` },
                { status: 404 }
            );
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { labId: lab.id },
            include: {
                user: true
            }
        });

        const progressList = await prisma.moduleProgress.findMany({
            where: {
                module: { labId: lab.id }
            }
        });

        const totalModulesCount = lab.modules.length;
        const scoredModules = lab.modules.filter(m =>
            m.type === "QUIZ" || m.type === "INTERACTIVE_VIDEO" || m.type === "SCORM" || m.type === "HTML"
        );

        const students = enrollments.map(enrollment => {
            const user = enrollment.user;
            const userProgress = progressList.filter(p => p.userId === user.id);
            const completedCount = userProgress.filter(p => p.completed).length;

            const progressPercentage = totalModulesCount > 0
                ? Math.round((completedCount / totalModulesCount) * 100)
                : 0;

            // Compute Final Score
            let finalScore = 0;
            if (scoredModules.length > 0) {
                let scoredCount = 0;
                let sumScores = 0;
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
                finalScore = scoredCount > 0 ? (sumScores / scoredModules.length) : 0;
            } else {
                finalScore = progressPercentage;
            }

            let latestCompletedAt = enrollment.completedAt;
            if (!latestCompletedAt && userProgress.length > 0) {
                const latestDate = userProgress.reduce((latest, current) => {
                    return current.updatedAt > latest ? current.updatedAt : latest;
                }, userProgress[0].updatedAt);
                latestCompletedAt = latestDate;
            }

            const roundedScore = Math.round(finalScore * 100) / 100;

            return {
                userId: user.id,
                email: user.email,
                name: user.name || user.email.split("@")[0],
                nim: user.nim || "",
                nidn: user.nidn || "",
                siakadUserId: user.siakadUserId || "",
                status: enrollment.status,
                progressPercentage,
                finalScore: roundedScore,
                score: roundedScore,
                completedAt: latestCompletedAt ? latestCompletedAt.toISOString() : null,
                completed_at: latestCompletedAt ? latestCompletedAt.toISOString() : null,
            };
        });

        return NextResponse.json({
            success: true,
            labId: lab.id,
            course_id: lab.id,
            siakadJadwalId: lab.siakadJadwalId,
            siakadMkKode: lab.siakadMkKode,
            title: lab.title,
            totalStudents: students.length,
            students,
            grades: students,
        });
    } catch (error: any) {
        console.error("Error fetching grades API:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch lab grades" },
            { status: 500 }
        );
    }
}
