import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import * as nodemailer from 'nodemailer'
import { initDB, UserModel, runWithContext } from 'lyzr-architect'
import getPasswordResetTokenModel from '@/models/PasswordResetToken'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    await initDB()

    // Build reset link host info before entering context
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'

    // Use runWithContext to bypass RLS for system-level operations
    const result = await runWithContext({ userId: 'system' } as any, async () => {
      // Check if user exists
      const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
      if (!user) {
        return { success: true, noUser: true }
      }

      // Generate a secure random token
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

      // Store hashed token in DB (expires in 15 minutes)
      const PasswordResetToken = await getPasswordResetTokenModel()

      // Delete any existing tokens for this email
      await PasswordResetToken.deleteMany({ email: email.toLowerCase().trim() })

      await PasswordResetToken.create({
        email: email.toLowerCase().trim(),
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
        owner_user_id: user._id?.toString() || 'system'
      })

      return { success: true, rawToken, userId: user._id?.toString() }
    })

    // If no user found, return generic message (prevent email enumeration)
    if (result.noUser) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    const resetLink = `${protocol}://${host}?resetToken=${result.rawToken}&resetEmail=${encodeURIComponent(email)}`

    // Try to send email via SMTP
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: smtpPort === '465',
        auth: { user: smtpUser, pass: smtpPass }
      })

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'CodeReview Pro - Reset Your Password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #001E2B; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #333; margin-bottom: 16px;">You requested a password reset for your CodeReview Pro account. Click the button below to set a new password.</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #00ED64; color: #001E2B; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
            <p style="color: #889397; font-size: 13px; margin-top: 24px;">This link expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // No SMTP configured — return link directly (dev mode)
    return NextResponse.json({
      success: true,
      message: 'SMTP is not configured. Use the link below to reset your password (dev mode only).',
      resetLink
    })
  } catch (e: any) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' }, { status: 500 })
  }
}
