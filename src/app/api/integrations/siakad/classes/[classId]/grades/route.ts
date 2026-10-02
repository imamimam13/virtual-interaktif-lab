import { NextRequest } from 'next/server';
import { handleGetLabGrades } from '@/lib/siakad-grades';

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const { classId } = await params;
    return handleGetLabGrades(req, classId);
}
