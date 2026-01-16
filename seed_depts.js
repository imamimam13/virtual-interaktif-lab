const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPARTMENTS = [
    { name: "Akuntansi (S1)" },
    { name: "Ilmu Lingkungan (S1)" },
    { name: "Ilmu Perikanan (S1)" },
    { name: "Manajemen (S1)" },
    { name: "Manajemen (S2)" },
];

async function main() {
    console.log('Seeding departments...');
    for (const dept of DEPARTMENTS) {
        await prisma.department.create({
            data: dept,
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
