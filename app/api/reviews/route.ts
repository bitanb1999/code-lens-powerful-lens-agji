import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getCurrentUserId } from 'lyzr-architect';
import getReviewModel from '@/models/Review';

async function handleGet(req: NextRequest) {
  try {
    const Review = await getReviewModel();
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const Review = await getReviewModel();
    const review = await Review.create({
      ...body,
      owner_user_id: getCurrentUserId()
    });
    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create review' }, { status: 500 });
  }
}

export const GET = authMiddleware(handleGet);
export const POST = authMiddleware(handlePost);
