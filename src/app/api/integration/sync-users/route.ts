import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySiakadApiKey } from "@/lib/siakad-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const authCheck = await verifySiakadApiKey(req);
    if (!authCheck.isValid) {
        return NextResponse.json(
            { success: false, error: authCheck.error || "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const rawUsers = Array.isArray(body) ? body : (body.users || [body]);

        if (!Array.isArray(rawUsers) || rawUsers.length === 0) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: array of users is required" },
                { status: 400 }
            );
        }

        let createdCount = 0;
        let updatedCount = 0;
        const results: Array<{ email: string; status: string; id?: string }> = [];

        // Cache departments by name to minimize queries
        const deptMap = new Map<string, string>();

        for (const item of rawUsers) {
            if (!item || !item.email) continue;

            const email = String(item.email).toLowerCase().trim();
            const name = item.name ? String(item.name).trim() : email.split("@")[0];
            const rawRole = (item.role || "STUDENT").toUpperCase();
            const role = ["LECTURER", "ADMIN", "STUDENT"].includes(rawRole) ? rawRole : "STUDENT";
            const nim = item.nim || (role === "STUDENT" ? item.nim_nidn : undefined);
            const nidn = item.nidn || (role === "LECTURER" ? item.nim_nidn : undefined);
            const phone = item.phone ? String(item.phone) : undefined;
            const siakadUserId = item.siakadUserId || item.id || undefined;
            const deptName = (item.departmentName || item.prodi || "").trim();

            let departmentId: string | undefined = undefined;
            if (deptName) {
                if (deptMap.has(deptName)) {
                    departmentId = deptMap.get(deptName);
                } else {
                    let dept = await prisma.department.findFirst({
                        where: { name: deptName }
                    });
                    if (!dept) {
                        dept = await prisma.department.create({
                            data: { name: deptName }
                        });
                    }
                    deptMap.set(deptName, dept.id);
                    departmentId = dept.id;
                }
            }

            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                const updated = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: name || existingUser.name,
                        role: role || existingUser.role,
                        nim: nim || existingUser.nim,
                        nidn: nidn || existingUser.nidn,
                        siakadUserId: siakadUserId || existingUser.siakadUserId,
                        phone: phone || existingUser.phone,
                        ...(departmentId ? { departmentId } : {}),
                    }
                });
                updatedCount++;
                results.push({ email, status: "updated", id: updated.id });
            } else {
                const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const created = await prisma.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPassword,
                        role,
                        nim,
                        nidn,
                        siakadUserId,
                        phone,
                        departmentId,
                    }
                });
                createdCount++;
                results.push({ email, status: "created", id: created.id });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Berhasil menyinkronkan ${results.length} pengguna`,
            created: createdCount,
            updated: updatedCount,
            total: results.length,
            users: results,
        });
    } catch (error: any) {
        console.error("Error in sync-users API:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to sync users" },
            { status: 500 }
        );
    }
}
