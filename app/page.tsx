'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AuthProvider, ProtectedRoute } from 'lyzr-architect/client'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  FiEye, FiLoader, FiMail, FiLock, FiUser, FiArrowLeft,
  FiEyeOff, FiCheck, FiCopy, FiZap, FiActivity, FiAlertTriangle,
  FiCode, FiPackage, FiLayers, FiTrendingUp
} from 'react-icons/fi'
import Header from './sections/Header'
import CodeInput from './sections/CodeInput'
import AnalysisResults from './sections/AnalysisResults'
import AnalysisHistory from './sections/AnalysisHistory'

const AGENT_ID = '69ebb0ca089f95578c0d0e8b'

type View = 'dashboard' | 'analyze' | 'results' | 'history'

interface CodeLensReport {
  health_score?: number
  project_name?: string
  languages?: string[]
  architecture?: string
  key_insights?: string[]
  structure?: {
    modules?: { name: string; purpose: string; file_count: number }[]
    entry_points?: string[]
    conventions?: string[]
  }
  code_entities?: {
    total_functions?: number
    total_classes?: number
    functions?: { name: string; params: string; return_type: string; description: string; module: string }[]
    classes?: { name: string; methods_count: number; description: string; module: string }[]
    design_patterns?: string[]
  }
  tech_debt?: {
    level?: string
    score?: number
    todos_count?: number
    code_smells_count?: number
    top_issues?: { issue: string; severity: string; location: string }[]
    remediation?: { action: string; priority: string; effort: string }[]
  }
  dependencies?: { name: string; status: string; note: string }[]
  llm_context?: string
  executive_summary?: string
}

interface AnalysisRecord {
  _id: string
  project_name: string
  health_score: number
  languages: string[]
  architecture: string
  tech_debt_level: string
  functions_count: number
  classes_count: number
  dependencies_count: number
  report_json: any
  createdAt: string
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FBFA' }}>
          <div className="text-center p-8 max-w-md">
            <FiAlertTriangle className="w-10 h-10 mx-auto mb-3" style={{ color: '#CF4C35' }} />
            <h2 className="text-xl font-medium mb-2" style={{ color: '#001E2B' }}>Something went wrong</h2>
            <p className="text-sm mb-4" style={{ color: '#5C6C75' }}>{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#00684A', color: '#FFFFFF' }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [devResetLink, setDevResetLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('resetToken')
    const resetEmail = params.get('resetEmail')
    if (token && resetEmail) {
      setResetToken(token)
      setEmail(decodeURIComponent(resetEmail))
      setMode('reset')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword(''); setName('')
    setError(''); setSuccessMsg(''); setShowPassword(false)
    setDevResetLink(''); setLinkCopied(false)
  }

  const switchMode = (m: AuthMode) => { resetForm(); setResetToken(''); setMode(m) }

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.success !== false) { window.location.reload() }
      else { setError(data.error || data.message || 'Login failed.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if (res.ok && data.success !== false) { window.location.reload() }
      else { setError(data.error || data.message || 'Registration failed.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError(''); setDevResetLink('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg(data.message || 'Password reset link sent.')
        if (data.resetLink) setDevResetLink(data.resetLink)
      } else { setError(data.error || 'Failed to send reset email.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleResetPassword = async () => {
    if (!resetToken) { setError('Invalid reset link.'); return }
    if (!password || !confirmPassword) { setError('Please fill in all fields'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token: resetToken })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg(data.message || 'Password reset successfully.')
        setResetToken('')
        setTimeout(() => switchMode('login'), 2000)
      } else { setError(data.error || 'Failed to reset password.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const inputStyle = 'pl-9 rounded-lg focus:outline-none'
  const inputBg = { background: '#FFFFFF', border: '1px solid #C1CCC6', color: '#001E2B' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F9FBFA' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: '#00684A' }}>
            <FiEye className="w-7 h-7" style={{ color: '#FFFFFF' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#001E2B' }}>
            Code <span style={{ color: '#00684A' }}>Lens</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5C6C75' }}>Deep Code Analysis & Insights Platform</p>
        </div>
        <div className="rounded-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FCE4E0', border: '1px solid #F5C6BE', color: '#CF4C35' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: '#E3FCF7', border: '1px solid #C1E7D8', color: '#00684A' }}>
              <FiCheck className="w-4 h-4 flex-shrink-0" /> {successMsg}
            </div>
          )}

          {mode === 'login' && (
            <>
              <h2 className="text-lg font-medium mb-5" style={{ color: '#001E2B' }}>Sign In</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Email</Label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputStyle} style={inputBg} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Password</Label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-9 pr-10 rounded-lg focus:outline-none" style={inputBg} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#889397' }}>
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => switchMode('forgot')} className="text-xs transition-colors" style={{ color: '#00684A' }}>Forgot Password?</button>
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full rounded-lg py-5 font-medium" style={{ background: '#00684A', color: '#FFFFFF' }}>
                  {loading ? <><FiLoader className="w-4 h-4 animate-spin mr-2" /> Signing in...</> : 'Sign In'}
                </Button>
              </div>
              <p className="text-center text-sm mt-5" style={{ color: '#5C6C75' }}>
                Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('register')} className="font-medium" style={{ color: '#00684A' }}>Create Account</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 className="text-lg font-medium mb-5" style={{ color: '#001E2B' }}>Create Account</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Full Name</Label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Email</Label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Password</Label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-9 pr-10 rounded-lg focus:outline-none" style={inputBg} />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#889397' }}>
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Confirm Password</Label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className={inputStyle} style={inputBg} onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
                  </div>
                </div>
                <Button onClick={handleRegister} disabled={loading} className="w-full rounded-lg py-5 font-medium" style={{ background: '#00684A', color: '#FFFFFF' }}>
                  {loading ? <><FiLoader className="w-4 h-4 animate-spin mr-2" /> Creating account...</> : 'Create Account'}
                </Button>
              </div>
              <p className="text-center text-sm mt-5" style={{ color: '#5C6C75' }}>
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="font-medium" style={{ color: '#00684A' }}>Sign In</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => switchMode('login')} style={{ color: '#5C6C75' }}><FiArrowLeft className="w-4 h-4" /></button>
                <h2 className="text-lg font-medium" style={{ color: '#001E2B' }}>Forgot Password</h2>
              </div>
              <p className="text-sm mb-5" style={{ color: '#5C6C75' }}>Enter your email and we will send you a reset link.</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Email</Label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputStyle} style={inputBg} onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()} />
                  </div>
                </div>
                <Button onClick={handleForgotPassword} disabled={loading} className="w-full rounded-lg py-5 font-medium" style={{ background: '#00684A', color: '#FFFFFF' }}>
                  {loading ? <><FiLoader className="w-4 h-4 animate-spin mr-2" /> Sending...</> : 'Send Reset Link'}
                </Button>
              </div>
              <p className="text-center text-sm mt-5" style={{ color: '#5C6C75' }}>
                Remember your password?{' '}
                <button onClick={() => switchMode('login')} className="font-medium" style={{ color: '#00684A' }}>Sign In</button>
              </p>
              {devResetLink && (
                <div className="mt-4 p-3 rounded-lg" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#FFC010' }}>Dev Mode - No SMTP configured</p>
                  <p className="text-xs mb-2" style={{ color: '#5C6C75' }}>Click below or copy the link:</p>
                  <a href={devResetLink} className="text-xs break-all block mb-2" style={{ color: '#00684A' }}>Open Reset Link</a>
                  <button onClick={() => { navigator.clipboard.writeText(devResetLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) }} className="flex items-center gap-1.5 text-xs" style={{ color: '#5C6C75' }}>
                    {linkCopied ? <><FiCheck className="w-3 h-3" style={{ color: '#00684A' }} /> Copied</> : <><FiCopy className="w-3 h-3" /> Copy Link</>}
                  </button>
                </div>
              )}
            </>
          )}

          {mode === 'reset' && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => switchMode('login')} style={{ color: '#5C6C75' }}><FiArrowLeft className="w-4 h-4" /></button>
                <h2 className="text-lg font-medium" style={{ color: '#001E2B' }}>Reset Password</h2>
              </div>
              {!resetToken ? (
                <div className="text-center py-4">
                  <p className="text-sm mb-4" style={{ color: '#CF4C35' }}>Invalid or missing reset link.</p>
                  <Button onClick={() => switchMode('forgot')} className="rounded-lg py-5 font-medium" style={{ background: '#FFFFFF', color: '#001E2B', border: '1px solid #E8EDEB' }}>
                    Request New Reset Link
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm mb-5" style={{ color: '#5C6C75' }}>Enter your new password below.</p>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>New Password</Label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                        <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-9 pr-10 rounded-lg focus:outline-none" style={inputBg} />
                        <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#889397' }}>
                          {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-1.5 block" style={{ color: '#5C6C75' }}>Confirm New Password</Label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#889397' }} />
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" className={inputStyle} style={inputBg} onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()} />
                      </div>
                    </div>
                    <Button onClick={handleResetPassword} disabled={loading} className="w-full rounded-lg py-5 font-medium" style={{ background: '#00684A', color: '#FFFFFF' }}>
                      {loading ? <><FiLoader className="w-4 h-4 animate-spin mr-2" /> Resetting...</> : 'Reset Password'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* --- Dashboard --- */
function DashboardView({ analyses, onNavigate, onSelectAnalysis }: {
  analyses: AnalysisRecord[]
  onNavigate: (v: View) => void
  onSelectAnalysis: (report: any) => void
}) {
  const totalAnalyses = analyses.length
  const avgScore = totalAnalyses > 0
    ? Math.round(analyses.reduce((sum, a) => sum + (a.health_score ?? 0), 0) / totalAnalyses)
    : 0
  const totalFunctions = analyses.reduce((sum, a) => sum + (a.functions_count ?? 0), 0)
  const totalClasses = analyses.reduce((sum, a) => sum + (a.classes_count ?? 0), 0)

  const recent = analyses.slice(0, 5)

  function getScoreColor(score: number) {
    if (score >= 80) return '#00684A'
    if (score >= 60) return '#FFC010'
    if (score >= 40) return '#E06F00'
    return '#CF4C35'
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Analyses', value: totalAnalyses, icon: FiActivity, color: '#00684A' },
          { label: 'Avg Health Score', value: avgScore, icon: FiTrendingUp, color: avgScore >= 70 ? '#00684A' : '#FFC010' },
          { label: 'Functions Found', value: totalFunctions, icon: FiCode, color: '#00684A' },
          { label: 'Classes Found', value: totalClasses, icon: FiLayers, color: '#00684A' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs" style={{ color: '#5C6C75' }}>{stat.label}</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('analyze')}
          className="rounded-lg p-5 text-left transition-all duration-200 hover:scale-[1.01]"
          style={{ background: '#E3FCF7', border: '1px solid #C1E7D8' }}
        >
          <FiZap className="w-6 h-6 mb-2" style={{ color: '#00684A' }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#001E2B' }}>New Analysis</h3>
          <p className="text-xs" style={{ color: '#5C6C75' }}>Paste your code and get deep insights instantly</p>
        </button>
        <button
          onClick={() => onNavigate('history')}
          className="rounded-lg p-5 text-left transition-all duration-200 hover:scale-[1.01]"
          style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}
        >
          <FiPackage className="w-6 h-6 mb-2" style={{ color: '#00684A' }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#001E2B' }}>Analysis History</h3>
          <p className="text-xs" style={{ color: '#5C6C75' }}>Browse and revisit your past code analyses</p>
        </button>
      </div>

      {/* Recent Analyses */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#00684A' }}>
            <FiActivity className="w-3.5 h-3.5" /> Recent Analyses
          </h3>
          <div className="space-y-2">
            {recent.map((a) => (
              <button
                key={a._id}
                onClick={() => onSelectAnalysis(a.report_json)}
                className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-[1.003]"
                style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: '#001E2B' }}>{a.project_name ?? 'Untitled'}</span>
                  <span className="text-xs font-bold" style={{ color: getScoreColor(a.health_score ?? 0) }}>{a.health_score ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.isArray(a.languages) && a.languages.slice(0, 3).map((lang, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E3FCF7', color: '#00684A' }}>{lang}</span>
                  ))}
                  <span className="text-xs ml-auto" style={{ color: '#5C6C75' }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {totalAnalyses === 0 && (
        <div className="text-center py-12 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}>
          <FiEye className="w-10 h-10 mx-auto mb-3" style={{ color: '#E8EDEB' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#001E2B' }}>Welcome to Code Lens</h3>
          <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: '#5C6C75' }}>
            Paste your code and get deep analysis -- structure, functions, classes, dependencies, tech debt, and LLM-optimized context. All in one shot.
          </p>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#00684A', color: '#FFFFFF' }}
          >
            Run Your First Analysis
          </button>
        </div>
      )}
    </div>
  )
}

/* --- Main App --- */
function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [currentReport, setCurrentReport] = useState<CodeLensReport | null>(null)
  const [sampleMode, setSampleMode] = useState(false)
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch('/api/analyses')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setAnalyses(data.data)
      }
    } catch { /* non-critical */ }
    finally { setHistoryLoading(false) }
  }, [])

  useEffect(() => { fetchAnalyses() }, [fetchAnalyses])

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as View)
    setAnalysisError('')
  }, [])

  const handleAnalyze = useCallback(async (code: string, projectName: string) => {
    if (!code.trim()) return
    setAnalysisLoading(true)
    setAnalysisError('')

    try {
      const message = `Analyze the following codebase thoroughly. Extract structure, functions, classes, dependencies, tech debt (TODOs, FIXMEs, code smells), and generate LLM-optimized context.\n\nProject Name: ${projectName || 'Unnamed Project'}\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide a comprehensive analysis with health_score, project structure, code entities, tech debt assessment, dependency analysis, and LLM-ready context string.`

      const result = await callAIAgent(message, AGENT_ID)

      if (result.success) {
        const rawResult = result?.response?.result
        const parsed = parseLLMJson(rawResult)
        if (parsed && typeof parsed === 'object' && !parsed.error) {
          const report = parsed as CodeLensReport
          setCurrentReport(report)
          setCurrentView('results')
          setSampleMode(false)

          // Save to DB
          try {
            const preview = code.trim().split('\n').slice(0, 2).join(' ').substring(0, 120)
            await fetch('/api/analyses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_name: report.project_name || projectName || 'Unnamed Project',
                code_snippet_preview: preview,
                languages: Array.isArray(report.languages) ? report.languages : [],
                health_score: report.health_score ?? 0,
                architecture: report.architecture ?? '',
                report_json: report,
                functions_count: report.code_entities?.total_functions ?? 0,
                classes_count: report.code_entities?.total_classes ?? 0,
                tech_debt_level: report.tech_debt?.level ?? 'unknown',
                todos_count: report.tech_debt?.todos_count ?? 0,
                dependencies_count: Array.isArray(report.dependencies) ? report.dependencies.length : 0
              })
            })
            fetchAnalyses()
          } catch { /* save failure is non-critical */ }
        } else {
          setAnalysisError('Failed to parse analysis. Please try again.')
        }
      } else {
        setAnalysisError(result?.error ?? 'Analysis failed. Please try again.')
      }
    } catch (e: any) {
      setAnalysisError(e?.message ?? 'An unexpected error occurred.')
    } finally {
      setAnalysisLoading(false)
    }
  }, [fetchAnalyses])

  const handleSelectAnalysis = useCallback((report: any) => {
    setCurrentReport(report as CodeLensReport)
    setCurrentView('results')
  }, [])

  const handleExportJSON = useCallback(() => {
    if (!currentReport) return
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentReport.project_name ?? 'analysis'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [currentReport])

  const handleExportText = useCallback(() => {
    if (!currentReport) return
    const lines: string[] = []
    lines.push(`# Code Lens Analysis: ${currentReport.project_name ?? 'Unnamed'}`)
    lines.push(`Health Score: ${currentReport.health_score ?? 0}/100`)
    lines.push(`Architecture: ${currentReport.architecture ?? 'Unknown'}`)
    lines.push(`Languages: ${Array.isArray(currentReport.languages) ? currentReport.languages.join(', ') : 'N/A'}`)
    lines.push('')
    if (currentReport.executive_summary) {
      lines.push('## Executive Summary')
      lines.push(currentReport.executive_summary)
      lines.push('')
    }
    if (Array.isArray(currentReport.key_insights) && currentReport.key_insights.length > 0) {
      lines.push('## Key Insights')
      currentReport.key_insights.forEach(i => lines.push(`- ${i}`))
      lines.push('')
    }
    if (currentReport.llm_context) {
      lines.push('## LLM Context')
      lines.push(currentReport.llm_context)
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentReport.project_name ?? 'analysis'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [currentReport])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9FBFA', color: '#001E2B' }}>
      <Header currentView={currentView} onViewChange={handleNavigate} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            analyses={analyses}
            onNavigate={handleNavigate}
            onSelectAnalysis={handleSelectAnalysis}
          />
        )}

        {currentView === 'analyze' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: '#001E2B' }}>New Analysis</h2>
              <button
                onClick={() => setSampleMode(prev => !prev)}
                className="text-xs px-3 py-1.5 rounded transition-all"
                style={{
                  background: sampleMode ? '#E3FCF7' : 'transparent',
                  color: sampleMode ? '#00684A' : '#5C6C75',
                  border: `1px solid ${sampleMode ? '#C1E7D8' : '#E8EDEB'}`,
                }}
              >
                {sampleMode ? 'Clear Sample' : 'Try Sample Code'}
              </button>
            </div>

            <CodeInput onAnalyze={handleAnalyze} loading={analysisLoading} sampleMode={sampleMode} />

            {analysisError && (
              <div className="p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: '#FCE4E0', border: '1px solid #F5C6BE', color: '#CF4C35' }}>
                <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                {analysisError}
              </div>
            )}
          </div>
        )}

        {currentView === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('analyze')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all"
                style={{ border: '1px solid #E8EDEB', color: '#5C6C75' }}
              >
                <FiArrowLeft className="w-3.5 h-3.5" /> New Analysis
              </button>
              <h2 className="text-lg font-bold" style={{ color: '#001E2B' }}>Analysis Results</h2>
            </div>
            <AnalysisResults
              report={currentReport}
              onExportJSON={handleExportJSON}
              onExportText={handleExportText}
            />
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: '#001E2B' }}>Analysis History</h2>
            <AnalysisHistory
              analyses={analyses}
              loading={historyLoading}
              onSelectAnalysis={handleSelectAnalysis}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute unauthenticatedFallback={<AuthScreen />}>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  )
}
