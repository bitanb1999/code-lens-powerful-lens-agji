'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiShield, FiZap, FiCheckCircle, FiPlus, FiAlertTriangle } from 'react-icons/fi'

interface ReviewRecord {
  _id: string
  code_snippet_preview: string
  language: string
  quality_score: number
  security_issues_count: number
  performance_issues_count: number
  createdAt: string
}

interface DashboardProps {
  onNavigate: (view: 'new-review' | 'history') => void
  onViewReview: (review: any) => void
}

export default function Dashboard({ onNavigate, onViewReview }: DashboardProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const totalReviews = reviews.length
  const avgScore = totalReviews > 0 ? Math.round(reviews.reduce((sum, r) => sum + (r.quality_score ?? 0), 0) / totalReviews) : 0
  const totalSecIssues = reviews.reduce((sum, r) => sum + (r.security_issues_count ?? 0), 0)
  const totalPerfIssues = reviews.reduce((sum, r) => sum + (r.performance_issues_count ?? 0), 0)
  const recentReviews = reviews.slice(0, 5)

  const scoreColor = (s: number) => s >= 71 ? 'text-[#00ED64]' : s >= 41 ? 'text-[#FFC010]' : 'text-[#FF6961]'

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-white">Dashboard</h2>
          <p className="text-sm text-[#889397] mt-1">Overview of your code reviews</p>
        </div>
        <Button onClick={() => onNavigate('new-review')} className="bg-[#00ED64] hover:bg-[#00C854] text-[#001E2B] rounded-lg gap-2 font-medium">
          <FiPlus className="w-4 h-4" /> New Review
        </Button>
      </div>

      {error && <div className="p-3 rounded-lg bg-[#FF6961]/10 border border-[#FF6961]/30 text-[#FF6961] text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: totalReviews, icon: FiCheckCircle, color: 'text-[#00ED64]' },
          { label: 'Avg Quality Score', value: `${avgScore}/100`, icon: FiCheckCircle, color: scoreColor(avgScore) },
          { label: 'Security Issues', value: totalSecIssues, icon: FiShield, color: totalSecIssues > 0 ? 'text-[#FF6961]' : 'text-[#00ED64]' },
          { label: 'Perf Issues', value: totalPerfIssues, icon: FiZap, color: totalPerfIssues > 0 ? 'text-[#FFC010]' : 'text-[#00ED64]' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#6B7C85] uppercase tracking-wider font-medium">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-medium">Recent Reviews</CardTitle>
            {totalReviews > 5 && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('history')} className="text-[#0498EC] hover:text-[#006BFF] text-xs">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#1C3D4F] rounded-lg animate-pulse" />)}
            </div>
          ) : recentReviews.length === 0 ? (
            <div className="text-center py-10">
              <FiCheckCircle className="w-10 h-10 text-[#6B7C85] mx-auto mb-3" />
              <p className="text-[#889397] text-sm">No reviews yet</p>
              <Button onClick={() => onNavigate('new-review')} className="mt-3 bg-[#00ED64] hover:bg-[#00C854] text-[#001E2B] rounded-lg gap-2 font-medium" size="sm">
                <FiPlus className="w-3.5 h-3.5" /> Start your first review
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentReviews.map((r) => (
                <button
                  key={r._id}
                  onClick={() => onViewReview(r)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1C3D4F] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono truncate">{r.code_snippet_preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{r.language}</Badge>
                      <span className="text-[10px] text-[#6B7C85]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className={`text-sm font-medium ${scoreColor(r.quality_score ?? 0)}`}>{r.quality_score ?? 0}</span>
                    {(r.security_issues_count ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <FiAlertTriangle className="w-3 h-3 text-[#FF6961]" />
                        <span className="text-xs text-[#FF6961]">{r.security_issues_count}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
