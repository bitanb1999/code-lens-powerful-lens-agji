import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getCurrentUserId } from 'lyzr-architect';
import getSettingsModel from '@/models/Settings';

async function handleGet(req: NextRequest) {
  try {
    const Settings = await getSettingsModel();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({
        default_language: 'javascript',
        strictness_level: 'standard',
        focus_areas: ['quality', 'security', 'performance'],
        owner_user_id: getCurrentUserId()
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

async function handlePut(req: NextRequest) {
  try {
    const body = await req.json();
    const Settings = await getSettingsModel();
    let settings = await Settings.findOne().lean();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, body, { new: true }).lean();
    } else {
      settings = await Settings.create({
        ...body,
        owner_user_id: getCurrentUserId()
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

export const GET = authMiddleware(handleGet);
export const PUT = authMiddleware(handlePut);
