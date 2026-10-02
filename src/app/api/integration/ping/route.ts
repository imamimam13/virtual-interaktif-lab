import { NextRequest, NextResponse } from "next/server";
import { verifySiakadApiKey } from "@/lib/siakad-auth";

export async function GET(req: NextRequest) {
    const authCheck = await verifySiakadApiKey(req);

    return NextResponse.json({
        success: true,
        status: "online",
        message: "Virtual Interaktif Lab API is ready and running",
        version: "1.2.0",
        authStatus: authCheck.isValid ? "authenticated" : "public_ping",
        timestamp: new Date().toISOString(),
    });
}
