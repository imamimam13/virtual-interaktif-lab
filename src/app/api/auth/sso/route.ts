import { NextRequest, NextResponse } from "next/server";
import { verifySiakadSsoToken } from "@/lib/siakad-auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const redirectUrl = searchParams.get("redirectUrl") || "/dashboard";

    if (!token) {
        return NextResponse.json(
            { success: false, error: "Missing token query parameter" },
            { status: 400 }
        );
    }

    const verification = await verifySiakadSsoToken(token);
    if (!verification.isValid) {
        return NextResponse.json(
            { success: false, error: verification.error || "Invalid SSO token" },
            { status: 401 }
        );
    }

    // Redirect to frontend SSO page which signs into NextAuth session
    const ssoFrontendUrl = new URL("/sso-login", req.url);
    ssoFrontendUrl.searchParams.set("token", token);
    ssoFrontendUrl.searchParams.set("redirectUrl", redirectUrl);

    return NextResponse.redirect(ssoFrontendUrl);
}
