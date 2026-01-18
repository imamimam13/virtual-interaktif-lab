"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ImportRow {
    labTitle: string;
    description: string;
    departmentName: string;
    moduleTitle: string;
    moduleType: string;
    content: string;
    labTitle: string;
    description: string;
    departmentName: string;
    instructor?: string; // New field
    grading?: string;   // New field (JSON string)
    moduleTitle: string;
    moduleType: string;
    content: string;
}

export async function bulkImportLabs(data: ImportRow[]) {
    try {
        // Group by Lab
        const labsMap = new Map<string, ImportRow[]>();

        data.forEach(row => {
            const key = `${row.labTitle}-${row.departmentName}`;
            if (!labsMap.has(key)) {
                labsMap.set(key, []);
            }
            labsMap.get(key)?.push(row);
        });

        for (const [key, rows] of labsMap.entries()) {
            const firstRow = rows[0];

            // Find Department
            const department = await prisma.department.findFirst({
                where: { name: firstRow.departmentName }
            });

            if (!department) {
                console.warn(`Department not found: ${firstRow.departmentName}, skipping lab.`);
                continue;
            }

            // Create or Find Lab
            let lab = await prisma.lab.findFirst({
                where: {
                    title: firstRow.labTitle,
                    departmentId: department.id
                }
            });

            if (!lab) {
                lab = await prisma.lab.create({
                    data: {
                        title: firstRow.labTitle,
                        description: firstRow.description,
                        departmentId: department.id,
                        thumbnail: "/images/placeholders/lab-default.jpg",
                        instructor: firstRow.instructor || "Tim Dosen",
                        grading: firstRow.grading ? firstRow.grading : undefined // Optional
                    }
                });
            }

            // Create Modules
            for (const [index, row] of rows.entries()) {
                await prisma.module.create({
                    data: {
                        title: row.moduleTitle,
                        type: row.moduleType.toUpperCase(),
                        content: row.content,
                        order: index + 1,
                        labId: lab.id
                    }
                });
            }
        }

        revalidatePath("/admin/labs");
        return { success: true, message: "Import successful" };
    } catch (error) {
        console.error("Import Error", error);
        return { success: false, message: "Failed to import data" };
    }
}
