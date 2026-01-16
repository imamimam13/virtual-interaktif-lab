const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEPARTMENTS = [
    { name: "Akuntansi (S1)" },
    { name: "Ilmu Lingkungan (S1)" },
    { name: "Ilmu Perikanan (S1)" },
    { name: "Manajemen (S1)" },
    { name: "Manajemen (S2)" },
];

const DEMO_CONTENT = {
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    quiz: JSON.stringify([
        { question: "Apa tujuan utama dari topik ini?", options: ["A", "B", "C", "D"], answer: 3 },
        { question: "Pertanyaan kedua?", options: ["Ya", "Tidak"], answer: 0 }
    ])
};

async function main() {
    console.log("🚀 Starting fresh seed...");

    // 1. Clean Database (Fresh Start)
    console.log("🧹 Cleaning old data...");
    await prisma.module.deleteMany();
    await prisma.lab.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();

    // 2. Seed Departments
    console.log("Creating Departments...");
    const depts = [];
    for (const d of DEPARTMENTS) {
        const dept = await prisma.department.create({ data: d });
        depts.push(dept);
    }

    // 3. Seed Users
    console.log("Creating Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@vil.com",
            password: hashedPassword,
            role: "ADMIN"
        }
    });

    await prisma.user.create({
        data: {
            name: "Student User",
            email: "student@vil.com",
            password: hashedPassword,
            role: "STUDENT"
        }
    });

    // 4. Seed Labs & Modules
    const LAB_TEMPLATES = [
        { name: "Akuntansi", labTitle: "Lab Audit Keuangan Digital", desc: "Simulasi audit menggunakan tools modern." },
        { name: "Ilmu Lingkungan", labTitle: "Lab Analisis Kualitas Air", desc: "Pengukuran parameter fisika dan kimia air." },
        { name: "Ilmu Perikanan", labTitle: "Lab Budidaya Perairan", desc: "Teknik manajemen kualitas air kolam." },
        { name: "Manajemen", labTitle: "Lab Manajemen Pemasaran", desc: "Strategi digital marketing dan branding." },
        { name: "Manajemen", labTitle: "Lab Manajemen SDM", desc: "Simulasi wawancara dan penilaian kinerja." },
    ];

    for (const dept of depts) {
        const templates = LAB_TEMPLATES.filter(t => dept.name.includes(t.name));

        for (const template of templates) {
            console.log(`Creating Lab: ${template.labTitle}...`);

            const lab = await prisma.lab.create({
                data: {
                    title: template.labTitle,
                    description: template.desc,
                    departmentId: dept.id,
                    thumbnail: "/images/placeholders/lab-default.jpg"
                }
            });

            await Promise.all([
                prisma.module.create({
                    data: { title: "Pengantar (Video)", type: "VIDEO", content: DEMO_CONTENT.video, labId: lab.id, order: 1 }
                }),
                prisma.module.create({
                    data: { title: "Materi Bacaan (PDF)", type: "PDF", content: DEMO_CONTENT.pdf, labId: lab.id, order: 2 }
                }),
                prisma.module.create({
                    data: { title: "Quiz Evaluasi", type: "QUIZ", content: DEMO_CONTENT.quiz, labId: lab.id, order: 3 }
                })
            ]);
        }
    }

    console.log("🎉 Seeding finished! Login with admin@vil.com / password123");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
