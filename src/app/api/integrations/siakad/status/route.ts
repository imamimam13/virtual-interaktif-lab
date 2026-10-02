import { NextRequest, NextResponse } from "next/server";
import { verifySiakadApiKey } from "@/lib/siakad-auth";

export async function GET(req: NextRequest) {
    const authCheck = await verifySiakadApiKey(req);

    return NextResponse.json({
        success: true,
        status: "online",
        message: "V-Labs API is ready",
        version: "1.2.0",
        authenticated: authCheck.isValid,
        timestamp: new Date().toISOString(),
    });
}
