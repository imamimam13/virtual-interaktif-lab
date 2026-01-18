
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log("Verifying Prisma Client Models (JS Mode)...");

    try {
        // Check Certificate
        if (prisma.certificate) {
            console.log("✅ prisma.certificate exists");
        } else {
            console.log("❌ prisma.certificate MISSING");
        }

        // Check CertificateTemplate
        if (prisma.certificateTemplate) {
            console.log("✅ prisma.certificateTemplate exists");
        } else {
            console.log("❌ prisma.certificateTemplate MISSING");
        }

        // Try a dummy query (names only)
        const certCount = await prisma.certificate.count();
        console.log(`✅ prisma.certificate.count() succeeded: ${certCount}`);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verify()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
