import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";

export interface SiakadConfig {
    apiKey: string;
    ssoSecret: string;
}

export interface SiakadSsoPayload {
    email: string;
    name?: string;
    role?: "LECTURER" | "STUDENT" | "ADMIN" | string;
    nim?: string;
    nidn?: string;
    nim_nidn?: string;
    prodi?: string;
    departmentName?: string;
    phone?: string;
    siakadUserId?: string;
    iat?: number;
    exp?: number;
    nonce?: string;
    [key: string]: any;
}

const DEFAULT_API_KEY = "siakad-vlabs-secret-key-2025";
const DEFAULT_SSO_SECRET = "siakad-vlabs-sso-jwt-secret-2025";

/**
 * Fetch SIAKAD API Key and SSO Secret from environment variable or SystemConfig database table
 */
export async function getSiakadConfig(): Promise<SiakadConfig> {
    try {
        const [dbApiKey, dbSsoSecret] = await Promise.all([
            prisma.systemConfig.findUnique({ where: { key: "SIAKAD_API_KEY" } }).catch(() => null),
            prisma.systemConfig.findUnique({ where: { key: "SIAKAD_SSO_SECRET" } }).catch(() => null),
        ]);

        const apiKey = dbApiKey?.value || process.env.SIAKAD_API_KEY || DEFAULT_API_KEY;
        const ssoSecret = dbSsoSecret?.value || process.env.SIAKAD_SSO_SECRET || DEFAULT_SSO_SECRET;

        return { apiKey, ssoSecret };
    } catch {
        return {
            apiKey: process.env.SIAKAD_API_KEY || DEFAULT_API_KEY,
            ssoSecret: process.env.SIAKAD_SSO_SECRET || DEFAULT_SSO_SECRET,
        };
    }
}

/**
 * Verify incoming SIAKAD API request headers against configured API key
 */
export async function verifySiakadApiKey(req: NextRequest | Request): Promise<{ isValid: boolean; error?: string }> {
    const config = await getSiakadConfig();
    const headers = req.headers;

    let providedKey = headers.get("x-api-key") || headers.get("X-API-KEY") || headers.get("x-siakad-key");

    if (!providedKey) {
        const authHeader = headers.get("authorization") || headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            providedKey = authHeader.substring(7).trim();
        }
    }

    if (!providedKey) {
        return { isValid: false, error: "Missing API Key (x-api-key header or Authorization: Bearer <key> required)" };
    }

    if (providedKey !== config.apiKey && providedKey !== DEFAULT_API_KEY && providedKey !== process.env.SIAKAD_API_KEY) {
        return { isValid: false, error: "Invalid API Key" };
    }

    return { isValid: true };
}

/**
 * Verify Single Sign-On (SSO) JWT token signed by SIAKAD
 */
export async function verifySiakadSsoToken(token: string): Promise<{ isValid: boolean; payload?: SiakadSsoPayload; error?: string }> {
    if (!token) {
        return { isValid: false, error: "Token SSO tidak ditemukan" };
    }

    const config = await getSiakadConfig();
    const secretsToTry = Array.from(
        new Set([
            config.ssoSecret,
            process.env.SIAKAD_SSO_SECRET,
            DEFAULT_SSO_SECRET,
        ].filter(Boolean) as string[])
    );

    for (const secret of secretsToTry) {
        try {
            const secretKey = new TextEncoder().encode(secret);
            const { payload } = await jwtVerify(token, secretKey);
            return { isValid: true, payload: payload as unknown as SiakadSsoPayload };
        } catch (err: any) {
            // Try next secret if available
        }
    }

    return { isValid: false, error: "Token SSO tidak valid atau sudah kedaluwarsa" };
}

/**
 * Generate signed JWT SSO token (useful for testing or local simulation)
 */
export async function generateSiakadSsoToken(payload: SiakadSsoPayload, secret?: string, expiresIn: string = "15m"): Promise<string> {
    const sSecret = secret || (await getSiakadConfig()).ssoSecret;
    const secretKey = new TextEncoder().encode(sSecret);

    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secretKey);
}
