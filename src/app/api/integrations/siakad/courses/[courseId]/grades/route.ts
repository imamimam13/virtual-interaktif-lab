import { NextRequest } from 'next/server';
import { handleGetLabGrades } from '@/lib/siakad-grades';

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    return handleGetLabGrades(req, courseId);
}
