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

        const title = body.title || body.module_title || body.course_name || "Modul Praktikum Virtual Lab";
        const description = body.description || `Modul praktikum untuk kelas ${body.course_name || body.siakadMkKode || ""}`.trim();
        const instructorEmail = (body.instructorEmail || body.instructor_email || "").toLowerCase().trim();
        const departmentName = (body.departmentName || body.category || body.prodi || "").trim();
        const siakadJadwalId = body.siakadJadwalId || body.siakad_class_id ? String(body.siakadJadwalId || body.siakad_class_id) : undefined;
        const siakadMkKode = body.siakadMkKode || body.course_code ? String(body.siakadMkKode || body.course_code) : undefined;
        const studentEmails: string[] = body.studentEmails || body.student_emails || [];

        // 1. Resolve Department
        let departmentId: string | undefined = undefined;
        if (departmentName) {
            let dept = await prisma.department.findFirst({
                where: { name: departmentName }
            });
            if (!dept) {
                dept = await prisma.department.create({
                    data: { name: departmentName }
                });
            }
            departmentId = dept.id;
        }

        // 2. Resolve Instructor Name
        let instructorName: string | undefined = undefined;
        if (instructorEmail) {
            const lecturer = await prisma.user.findUnique({
                where: { email: instructorEmail }
            });
            if (lecturer) {
                instructorName = lecturer.name || lecturer.email;
            } else {
                // Auto create lecturer account if not existing
                const randomPass = Math.random().toString(36).slice(-10) + Date.now().toString(36);
                const hashedPassword = await bcrypt.hash(randomPass, 10);
                const newLecturer = await prisma.user.create({
                    data: {
                        email: instructorEmail,
                        name: instructorEmail.split("@")[0],
                        role: "LECTURER",
                        password: hashedPassword,
                        departmentId,
                    }
                });
                instructorName = newLecturer.name || newLecturer.email;
            }
        }

        // 3. Find or Create Lab
        let lab = null;
        if (siakadJadwalId) {
            lab = await prisma.lab.findFirst({
                where: { siakadJadwalId }
            });
        }

        if (!lab) {
            lab = await prisma.lab.create({
                data: {
                    title,
                    description,
                    instructor: instructorName || "Dosen Pengampu",
                    siakadJadwalId,
                    siakadMkKode,
                    departmentId,
                    isPublic: false,
                    price: 0,
                }
            });
        } else {
            // Update lab details if needed
            lab = await prisma.lab.update({
                where: { id: lab.id },
                data: {
                    title: title || lab.title,
                    description: description || lab.description,
                    instructor: instructorName || lab.instructor,
                    siakadMkKode: siakadMkKode || lab.siakadMkKode,
                    ...(departmentId ? { departmentId } : {}),
                }
            });
        }

        // 4. Auto-enroll Students
        let enrolledCount = 0;
        if (Array.isArray(studentEmails) && studentEmails.length > 0) {
            for (const rawEmail of studentEmails) {
                if (!rawEmail) continue;
                const sEmail = String(rawEmail).toLowerCase().trim();

                let student = await prisma.user.findUnique({
                    where: { email: sEmail }
                });

                if (!student) {
                    const randomPass = Math.random().toString(36).slice(-10) + Date.now().toString(36);
                    const hashedPassword = await bcrypt.hash(randomPass, 10);
                    student = await prisma.user.create({
                        data: {
                            email: sEmail,
                            name: sEmail.split("@")[0],
                            role: "STUDENT",
                            password: hashedPassword,
                            departmentId,
                        }
                    });
                }

                // Check Enrollment
                const existingEnrollment = await prisma.enrollment.findUnique({
                    where: {
                        userId_labId: {
                            userId: student.id,
                            labId: lab.id,
                        }
                    }
                });

                if (!existingEnrollment) {
                    await prisma.enrollment.create({
                        data: {
                            userId: student.id,
                            labId: lab.id,
                            status: "ACTIVE",
                            paymentStatus: "PAID",
                        }
                    });
                    enrolledCount++;
                } else if (existingEnrollment.status !== "ACTIVE" || existingEnrollment.paymentStatus !== "PAID") {
                    await prisma.enrollment.update({
                        where: { id: existingEnrollment.id },
                        data: {
                            status: "ACTIVE",
                            paymentStatus: "PAID",
                        }
                    });
                    enrolledCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Laboratorium berhasil ditautkan dan mahasiswa berhasil didaftarkan",
            labId: lab.id,
            course_id: lab.id,
            module_title: lab.title,
            siakadJadwalId: lab.siakadJadwalId,
            siakadMkKode: lab.siakadMkKode,
            urlEditor: `/admin/labs/${lab.id}/modules`,
            urlStudentLab: `/dashboard/labs/${lab.id}`,
            enrolled_students: enrolledCount,
        });
    } catch (error: any) {
        console.error("Error in create-or-link-lab API:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create or link lab" },
            { status: 500 }
        );
    }
}
