import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./print-button";

// Force printer CSS
import "./print.css";

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    // @ts-ignore
    const certificate = await (prisma as any).certificate.findUnique({
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
        // @ts-ignore
        template = await (prisma as any).certificateTemplate.findFirst({
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
        // High-End Official Academic Fallback Template
        finalCss = `
            @page { size: A4 landscape; margin: 0; }
            .cert-container {
                width: 1123px;
                height: 794px;
                background: linear-gradient(135deg, #fdfbf7 0%, #ffffff 50%, #f7f9fc 100%);
                padding: 40px;
                box-sizing: border-box;
                font-family: 'Times New Roman', Times, Georgia, serif;
                position: relative;
                color: #1e293b;
                overflow: hidden;
            }
            .cert-border-outer {
                width: 100%;
                height: 100%;
                border: 3px solid #1e3a8a;
                padding: 8px;
                box-sizing: border-box;
                position: relative;
            }
            .cert-border-inner {
                width: 100%;
                height: 100%;
                border: 2px solid #d97706;
                padding: 24px 36px;
                box-sizing: border-box;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: center;
                background: radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(254,249,235,0.7) 100%);
            }
            .cert-corner {
                position: absolute;
                width: 24px;
                height: 24px;
                border-color: #d97706;
            }
            .corner-tl { top: -2px; left: -2px; border-top: 4px solid #d97706; border-left: 4px solid #d97706; }
            .corner-tr { top: -2px; right: -2px; border-top: 4px solid #d97706; border-right: 4px solid #d97706; }
            .corner-bl { bottom: -2px; left: -2px; border-bottom: 4px solid #d97706; border-left: 4px solid #d97706; }
            .corner-br { bottom: -2px; right: -2px; border-bottom: 4px solid #d97706; border-right: 4px solid #d97706; }
            
            .cert-header {
                font-family: Arial, Helvetica, sans-serif;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #1e3a8a;
            }
            .cert-header h4 { font-size: 13px; font-weight: 700; margin: 0; color: #64748b; }
            .cert-header h3 { font-size: 17px; font-weight: 800; margin: 3px 0 0; color: #1e3a8a; letter-spacing: 3px; }
            
            .cert-title-block {
                margin: 4px 0;
            }
            .cert-title {
                font-size: 34px;
                font-weight: 900;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: #1e293b;
                margin: 0;
                background: linear-gradient(45deg, #1e3a8a, #d97706);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .cert-subtitle {
                font-size: 12px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #94a3b8;
                font-family: Arial, Helvetica, sans-serif;
                margin-top: 2px;
            }
            .cert-code {
                font-family: monospace;
                font-size: 11px;
                color: #64748b;
                margin-top: 4px;
                background: #f1f5f9;
                display: inline-block;
                padding: 2px 10px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
            }

            .cert-body {
                margin: 4px 0;
            }
            .cert-recipient-label {
                font-size: 14px;
                color: #64748b;
                font-style: italic;
                margin-bottom: 6px;
            }
            .cert-name {
                font-size: 36px;
                font-weight: bold;
                color: #0f172a;
                margin: 4px 0;
                border-bottom: 2px solid #f59e0b;
                display: inline-block;
                padding: 0 40px 6px;
                letter-spacing: 1px;
            }
            .cert-desc {
                font-size: 14px;
                color: #475569;
                margin: 10px auto 4px;
                max-width: 780px;
                line-height: 1.4;
            }
            .cert-lab {
                font-size: 22px;
                font-weight: bold;
                color: #1e3a8a;
                margin: 4px 0;
                letter-spacing: 0.5px;
            }
            .cert-date {
                font-size: 13px;
                color: #64748b;
                margin-top: 4px;
                font-family: Arial, Helvetica, sans-serif;
            }

            .cert-footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 0 40px;
                margin-top: 10px;
                font-family: Arial, Helvetica, sans-serif;
            }
            .sig-block {
                text-align: center;
                width: 220px;
            }
            .sig-line {
                border-top: 1.5px solid #334155;
                margin-top: 45px;
                padding-top: 6px;
            }
            .sig-name {
                font-weight: 700;
                font-size: 13px;
                color: #0f172a;
            }
            .sig-role {
                font-size: 11px;
                color: #64748b;
                margin-top: 2px;
            }

            .cert-seal {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .seal-badge {
                width: 65px;
                height: 65px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: 3px double #ffffff;
                box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 22px;
                font-weight: bold;
            }
            .seal-text {
                font-size: 9px;
                letter-spacing: 1px;
                font-weight: 700;
                color: #d97706;
                text-transform: uppercase;
                margin-top: 4px;
            }
        `;

        finalHtml = `
            <div class="cert-container">
                <div class="cert-border-outer">
                    <div class="cert-border-inner">
                        <div class="cert-corner corner-tl"></div>
                        <div class="cert-corner corner-tr"></div>
                        <div class="cert-corner corner-bl"></div>
                        <div class="cert-corner corner-br"></div>

                        <!-- Header -->
                        <div class="cert-header">
                            <h4>LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT</h4>
                            <h3>UNIVERSITAS WIRALODRA</h3>
                        </div>

                        <!-- Title -->
                        <div class="cert-title-block">
                            <h1 class="cert-title">SERTIFIKAT KELULUSAN</h1>
                            <div class="cert-subtitle">CERTIFICATE OF COMPLETION</div>
                            <div class="cert-code">Nomor: ${data.code}</div>
                        </div>

                        <!-- Body Content -->
                        <div class="cert-body">
                            <div class="cert-recipient-label">Diberikan dengan bangga kepada:</div>
                            <div class="cert-name">${data.name}</div>
                            <div class="cert-desc">Telah berhasil menyelesaikan seluruh modul pembelajaran, praktikum simulasi interaktif, dan evaluasi kompetensi pada:</div>
                            <div class="cert-lab">${data.lab}</div>
                            <div class="cert-date">Diterbitkan pada tanggal: <strong>${data.date}</strong></div>
                        </div>

                        <!-- Signatures & Verification Seal -->
                        <div class="cert-footer">
                            <div class="sig-block">
                                <div class="sig-line">
                                    <div class="sig-name">${data.instructor}</div>
                                    <div class="sig-role">Instruktur / Pengampu Lab</div>
                                </div>
                            </div>

                            <div class="cert-seal">
                                <div class="seal-badge">★</div>
                                <div class="seal-text">VERIFIED ACADEMIC</div>
                            </div>

                            <div class="sig-block">
                                <div class="sig-line">
                                    <div class="sig-name">Kepala LPPM</div>
                                    <div class="sig-role">Universitas Wiralodra</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
