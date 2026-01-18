import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./print-button";

// Force printer CSS
import "./print.css";

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    const certificate = await prisma.certificate.findUnique({
        where: { code },
        include: {
            user: true,
            lab: {
                include: {
                    department: true,
                    certificateTemplate: true
                }
            }
        }
    });

    if (!certificate) {
        notFound();
    }

    // Determine which template to use
    let template = certificate.lab.certificateTemplate;

    // If no assigned template, find system default
    if (!template) {
        template = await prisma.certificateTemplate.findFirst({
            where: { isDefault: true }
        });
    }

    // Prepare data
    const data = {
        name: certificate.user.name || "Mahasiswa",
        lab: certificate.labTitle,
        code: certificate.code,
        date: new Date(certificate.issuedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }),
        instructor: certificate.lab.instructor || "LPPM"
    };

    let finalHtml = "";
    let finalCss = "";

    if (template) {
        let compiled = template.html;
        compiled = compiled.replace(/{{name}}/g, data.name);
        compiled = compiled.replace(/{{lab}}/g, data.lab);
        compiled = compiled.replace(/{{code}}/g, data.code);
        compiled = compiled.replace(/{{date}}/g, data.date);
        compiled = compiled.replace(/{{instructor}}/g, data.instructor);

        finalHtml = compiled;
        finalCss = template.css;
    } else {
        // Hardcoded Fallback
        finalCss = `.cert-container { text-align: center; padding: 50px; border: 10px solid #ddd; font-family: sans-serif; } 
                    h1 { color: #333; margin-bottom: 20px; }
                    .name { color: #0056b3; font-size: 2em; margin: 20px 0; border-bottom: 1px solid #ccc; display: inline-block; padding: 0 20px 10px; }`;
        finalHtml = `
            <div class="cert-container">
                <h1>Sertifikat Kelulusan</h1>
                <p>Nomor: ${data.code}</p>
                <p>Diberikan kepada:</p>
                <div class="name">${data.name}</div>
                <p>Atas penyelesaian modul pembelajaran pada:</p>
                <h2>${data.lab}</h2>
                <p>Tanggal: ${data.date}</p>
                <br/><br/>
                <p><strong>${data.instructor}</strong><br/>Instruktur</p>
            </div>
        `;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            <div className="mb-8 print:hidden">
                <PrintButton />
            </div>

            <style dangerouslySetInnerHTML={{ __html: finalCss }} />
            <div
                className="bg-white shadow-2xl print:shadow-none print:w-full print:h-full print:absolute print:inset-0 w-[1123px] h-[794px] overflow-hidden relative"
                dangerouslySetInnerHTML={{ __html: finalHtml }}
            />
        </div>
    );
}
