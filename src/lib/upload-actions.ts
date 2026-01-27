"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function uploadRom(formData: FormData) {
    const file = formData.get("file") as File | null;

    if (!file) {
        return { success: false, message: "No file uploaded" };
    }

    const validExtensions = [".nes", ".snes", ".smc", ".gba", ".gb", ".gbc", ".sega", ".md", ".bin", ".zip", ".7z", ".iso", ".n64", ".z64", ".nds"];
    const fileName = file.name.toLowerCase();

    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValid) {
        return { success: false, message: "Invalid file type. Allowed: .nes, .snes, .gba, .sega, .n64, .nds, .zip" };
    }

    // Limit size (e.g., 50MB for now, enough for N64/NDS)
    if (file.size > 50 * 1024 * 1024) {
        return { success: false, message: "File too large (Max 50MB)" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueName = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", "roms");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, uniqueName);

    try {
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/roms/${uniqueName}`;
        return { success: true, url: publicUrl, message: "File uploaded successfully" };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, message: "Failed to save file" };
    }
}
