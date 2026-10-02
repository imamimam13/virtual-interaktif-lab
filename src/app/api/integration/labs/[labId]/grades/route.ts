import { NextRequest } from "next/server";
import { handleGetLabGrades } from "@/lib/siakad-grades";

export async function GET(req: NextRequest, { params }: { params: Promise<{ labId: string }> }) {
    const { labId } = await params;
    return handleGetLabGrades(req, labId);
}
