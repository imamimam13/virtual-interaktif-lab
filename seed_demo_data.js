const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEMO_CONTENT = {
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll placeholder, or meaningful one
    pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    quiz: JSON.stringify([
        {
            question: "Apa tujuan utama dari topik ini?",
            options: ["Meningkatkan Profit", "Menjaga Lingkungan", "Mengatur Karyawan", "Semua Benar"],
            answer: 3
        },
        {
            question: "Manakah yang bukan termasuk dalam prinsip dasar?",
            options: ["Transparansi", "Akuntabilitas", "Korupsi", "Responsibilitas"],
            answer: 2
        }
    ])
};

async function main() {
    console.log("🚀 Starting seed...");

    // Get all departments
    const departments = await prisma.department.findMany();

    if (departments.length === 0) {
        console.log("No departments found. Please run seed_depts.js first or I will create them.");
        // Optional: create depts if missing, but assuming they exist from previous step
    }

    const LAB_TEMPLATES = [
        { name: "Akuntansi", labTitle: "Lab Audit Keuangan Digital", desc: "Simulasi audit menggunakan tools modern." },
        { name: "Ilmu Lingkungan", labTitle: "Lab Analisis Kualitas Air", desc: "Pengukuran parameter fisika dan kimia air." },
        { name: "Ilmu Perikanan", labTitle: "Lab Budidaya Perairan", desc: "Teknik manajemen kualitas air kolam." },
        { name: "Manajemen", labTitle: "Lab Manajemen Pemasaran", desc: "Strategi digital marketing dan branding." },
        { name: "Manajemen", labTitle: "Lab Manajemen SDM", desc: "Simulasi wawancara dan penilaian kinerja." }, // Duplicate dept name handling
    ];

    for (const dept of departments) {
        // Find a suitable template based on dept name
        const templates = LAB_TEMPLATES.filter(t => dept.name.includes(t.name));

        if (templates.length === 0) {
            // Default fallback
            templates.push({
                labTitle: `Lab Praktikum ${dept.name}`,
                desc: `Materi praktikum untuk prodi ${dept.name}`
            });
        }

        for (const template of templates) {
            console.log(`Creating Lab: ${template.labTitle} for ${dept.name}...`);

            const lab = await prisma.lab.create({
                data: {
                    title: template.labTitle,
                    description: template.desc,
                    departmentId: dept.id,
                    thumbnail: "/images/placeholders/lab-default.jpg"
                }
            });

            // Create 3 Modules
            await Promise.all([
                prisma.module.create({
                    data: {
                        title: "Pengantar Materi (Video)",
                        type: "VIDEO",
                        content: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
                        labId: lab.id,
                        order: 1
                    }
                }),
                prisma.module.create({
                    data: {
                        title: "Modul Bacaan (PDF)",
                        type: "PDF",
                        content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                        labId: lab.id,
                        order: 2
                    }
                }),
                prisma.module.create({
                    data: {
                        title: "Kuis Evaluasi",
                        type: "QUIZ",
                        content: DEMO_CONTENT.quiz,
                        labId: lab.id,
                        order: 3
                    }
                })
            ]);
            console.log(`   ✅ Modules added to ${template.labTitle}`);
        }
    }

    // Create one Independent Lab
    console.log("Creating Independent Lab...");
    const indLab = await prisma.lab.create({
        data: {
            title: "Lab Kewirausahaan Dasar (Umum)",
            description: "Materi dasar entrepreneurship untuk semua jurusan.",
            departmentId: null, // Independent
            thumbnail: "/images/placeholders/lab-default.jpg"
        }
    });

    await Promise.all([
        prisma.module.create({
            data: { title: "Mindset Wirausaha", type: "VIDEO", content: "https://www.youtube.com/watch?v=LXb3EKWsInQ", labId: indLab.id, order: 1 }
        }),
        prisma.module.create({
            data: { title: "Business Plan Canvas", type: "PDF", content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", labId: indLab.id, order: 2 }
        })
    ]);

    console.log("🎉 Seeding finished!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
