import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getCurrentUserId } from 'lyzr-architect';
import getAnalysisModel from '@/models/Analysis';

async function handleGet(req: NextRequest) {
  try {
    const Analysis = await getAnalysisModel();
    const analyses = await Analysis.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: analyses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch analyses' }, { status: 500 });
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const Analysis = await getAnalysisModel();
    const analysis = await Analysis.create({
      ...body,
      owner_user_id: getCurrentUserId()
    });
    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create analysis' }, { status: 500 });
  }
}

export const GET = authMiddleware(handleGet);
export const POST = authMiddleware(handlePost);
