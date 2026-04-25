'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiSearch, FiClock, FiShield, FiZap, FiLoader } from 'react-icons/fi'

interface ReviewRecord {
  _id: string
  code_snippet_preview: string
  language: string
  report_json: any
  quality_score: number
  security_issues_count: number
  performance_issues_count: number
  createdAt: string
}

interface ReviewHistoryProps {
  onViewReview: (review: ReviewRecord) => void
}

export default function ReviewHistory({ onViewReview }: ReviewHistoryProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data)
      } else {
        setError(data.error || 'Failed to load reviews')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const languages = Array.from(new Set(reviews.map(r => r.language).filter(Boolean)))

  const filtered = reviews
    .filter(r => {
      if (search && !(r.code_snippet_preview ?? '').toLowerCase().includes(search.toLowerCase())) return false
      if (langFilter !== 'all' && r.language !== langFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.quality_score ?? 0) - (a.quality_score ?? 0)
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })

  const scoreColor = (s: number) => s >= 71 ? 'text-[#00ED64]' : s >= 41 ? 'text-[#FFC010]' : 'text-[#FF6961]'

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div>
        <h2 className="text-xl font-medium text-white">Review History</h2>
        <p className="text-sm text-[#889397] mt-1">{reviews.length} reviews saved</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-[#FF6961]/10 border border-[#FF6961]/30 text-[#FF6961] text-sm">{error}</div>}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7C85]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="pl-9 bg-[#0A1E29] border-[#243D4D] text-white rounded-lg focus:ring-[#00ED64] focus:border-[#00ED64]"
          />
        </div>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[140px] bg-[#0A1E29] border-[#243D4D] text-white rounded-lg">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="bg-[#112733] border-[#243D4D]">
            <SelectItem value="all" className="text-white focus:bg-[#1C3D4F] focus:text-white">All Languages</SelectItem>
            {languages.map(l => (
              <SelectItem key={l} value={l} className="text-white focus:bg-[#1C3D4F] focus:text-white">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'score')}>
          <SelectTrigger className="w-[140px] bg-[#0A1E29] border-[#243D4D] text-white rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#112733] border-[#243D4D]">
            <SelectItem value="date" className="text-white focus:bg-[#1C3D4F] focus:text-white">By Date</SelectItem>
            <SelectItem value="score" className="text-white focus:bg-[#1C3D4F] focus:text-white">By Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="w-6 h-6 text-[#00ED64] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FiClock className="w-10 h-10 text-[#6B7C85] mx-auto mb-3" />
              <p className="text-[#889397] text-sm">No reviews found</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y divide-[#1C3D4F]">
                {filtered.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => onViewReview(r)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#1C3D4F] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-mono truncate max-w-[400px]">{r.code_snippet_preview}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{r.language}</Badge>
                        <span className="text-[10px] text-[#6B7C85]">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className={`text-lg font-medium ${scoreColor(r.quality_score ?? 0)}`}>{r.quality_score ?? 0}</span>
                      <div className="flex items-center gap-1">
                        <FiShield className="w-3 h-3 text-[#FF6961]" />
                        <span className="text-xs text-[#889397]">{r.security_issues_count ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiZap className="w-3 h-3 text-[#FFC010]" />
                        <span className="text-xs text-[#889397]">{r.performance_issues_count ?? 0}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
