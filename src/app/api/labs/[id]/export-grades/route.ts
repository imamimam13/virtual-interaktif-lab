
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: labId } = await params;

    // Fetch enrollments with user data and module progress
    const enrollments = await prisma.enrollment.findMany({
        where: { labId },
        include: {
            user: true,
            lab: {
                include: {
                    modules: true
                }
            }
        }
    });

    // Fetch all progress for this lab
    // We can optimize this but for now getting all relevant progress
    const progress = await prisma.moduleProgress.findMany({
        where: {
            module: { labId }
        }
    });

    // Construct CSV
    // Header: Name, Email, Department, Status, [Module 1 Score], [Module 2 Score], Final Score
    const lab = enrollments[0]?.lab;
    if (!lab) {
        return new NextResponse("No data found", { status: 404 });
    }

    const modules = lab.modules.sort((a, b) => a.order - b.order);
    const header = ["Name", "Email", "Department", "Status", ...modules.map(m => `"${m.title} (${m.type})"`), "Final Grade"];

    // Rows
    const rows = enrollments.map(enrollment => {
        const userProgress = progress.filter(p => p.userId === enrollment.userId);

        let totalWeightedScore = 0;
        let totalWeight = 0;

        // Simplify grading for CSV: Just sum of quiz scores for simplicity in this MVP, 
        // or adhere to JSON config if possible. 
        // For MVP: Let's just list raw scores of modules.

        const moduleScores = modules.map(m => {
            const p = userProgress.find(prog => prog.moduleId === m.id);
            if (!p) return "0";
            if (m.type === "QUIZ" || m.type === "INTERACTIVE_VIDEO") return p.score || "0";
            return p.completed ? "Completed" : "Incomplete";
        });

        // Basic final grade assumption (avg of quizzes)
        const quizModules = modules.filter(m => m.type === "QUIZ" || m.type === "INTERACTIVE_VIDEO");
        let finalGrade = 0;
        if (quizModules.length > 0) {
            const totalQuizScore = quizModules.reduce((acc, m) => {
                const p = userProgress.find(prog => prog.moduleId === m.id);
                return acc + (p?.score || 0);
            }, 0);
            finalGrade = totalQuizScore / quizModules.length; // Average
        }

        // TODO: Use lab.grading JSON to calculate robust weighted score if needed.

        return [
            `"${enrollment.user.name || "N/A"}"`,
            enrollment.user.email,
            "N/A", // User Department relation not always fetched or stored directly on user object in previous fetches depending on query
            enrollment.status,
            ...moduleScores,
            finalGrade.toFixed(2)
        ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="PixelLab_Grades_${lab.title.replace(/\s+/g, "_")}.csv"`,
        },
    });
}
