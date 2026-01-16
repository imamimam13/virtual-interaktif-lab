const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@wirabhakti.ac.id' },
        update: {},
        create: {
            email: 'admin@wirabhakti.ac.id',
            name: 'Admin Lab',
            password: password,
            role: 'ADMIN',
        },
    });

    const student = await prisma.user.upsert({
        where: { email: 'student@wirabhakti.ac.id' },
        update: {},
        create: {
            email: 'student@wirabhakti.ac.id',
            name: 'Mahasiswa Teladan',
            password: password,
            role: 'STUDENT',
        },
    });

    console.log({ admin, student });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
