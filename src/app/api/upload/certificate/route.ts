import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, message: "Tidak ada file yang diunggah" },
                { status: 400 }
            );
        }

        const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau SVG" },
                { status: 400 }
            );
        }

        // Limit size to 20MB
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: "Ukuran file terlalu besar (Maksimal 20MB)" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = fileName.substring(fileName.lastIndexOf("."));
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueName = `cert-${Date.now()}-${randomUUID().slice(0, 8)}-${cleanName}`;

        const uploadDir = join(process.cwd(), "public", "uploads", "certificates");

        try {
            await mkdir(uploadDir, { recursive: true });
            const filePath = join(uploadDir, uniqueName);
            await writeFile(filePath, buffer);

            const publicUrl = `/uploads/certificates/${uniqueName}`;
            return NextResponse.json({
                success: true,
                url: publicUrl,
                message: "Gambar berhasil diunggah"
            });
        } catch (fsError: any) {
            console.warn("Filesystem write failed, falling back to base64 data URL:", fsError);

            // Fallback: If disk write is denied (e.g. read-only container), return data URL so user can still design & save
            const mimeType = file.type || (ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "image/jpeg");
            const base64Data = buffer.toString("base64");
            const dataUrl = `data:${mimeType};base64,${base64Data}`;

            return NextResponse.json({
                success: true,
                url: dataUrl,
                message: "Gambar berhasil dimuat (Data URL)"
            });
        }
    } catch (error: any) {
        console.error("Certificate upload error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Terjadi kesalahan pada server saat mengunggah gambar" },
            { status: 500 }
        );
    }
}
