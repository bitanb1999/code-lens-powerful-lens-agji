import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { initDB, UserModel, hashPassword, runWithContext } from 'lyzr-architect'
import getPasswordResetTokenModel from '@/models/PasswordResetToken'

export async function POST(req: NextRequest) {
  try {
    const { email, password, token } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Token, email and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    await initDB()
    const PasswordResetToken = await getPasswordResetTokenModel()

    // Hash the incoming token the same way we stored it
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    // Use runWithContext to bypass RLS for system-level password reset
    const result = await runWithContext({ userId: 'system' } as any, async () => {
      // Find valid, unused, non-expired token for this email
      const resetRecord = await PasswordResetToken.findOne({
        email: email.toLowerCase().trim(),
        tokenHash,
        used: false,
        expiresAt: { $gt: new Date() }
      })

      if (!resetRecord) {
        return { success: false, error: 'Invalid or expired reset link. Please request a new one.', status: 400 }
      }

      // Find user
      const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
      if (!user) {
        return { success: false, error: 'Account not found.', status: 400 }
      }

      // Hash new password and update user
      const hashed = await hashPassword(password)
      user.password = hashed
      await user.save()

      // Delete all tokens for this email
      await PasswordResetToken.deleteMany({ email: email.toLowerCase().trim() })

      return { success: true }
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    })
  } catch (e: any) {
    console.error('Reset password error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
