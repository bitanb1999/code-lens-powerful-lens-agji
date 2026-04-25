'use client'

import { useState } from 'react'
import { FiSearch, FiFileText, FiActivity } from 'react-icons/fi'

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

interface AnalysisHistoryProps {
  analyses: AnalysisRecord[]
  loading: boolean
  onSelectAnalysis: (report: any) => void
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00684A'
  if (score >= 60) return '#FFC010'
  if (score >= 40) return '#E06F00'
  return '#CF4C35'
}

function getDebtColor(level: string): string {
  const l = (level ?? '').toLowerCase()
  if (l === 'low') return '#00684A'
  if (l === 'medium' || l === 'moderate') return '#FFC010'
  return '#CF4C35'
}

export default function AnalysisHistory({ analyses, loading, onSelectAnalysis }: AnalysisHistoryProps) {
  const [search, setSearch] = useState('')

  const filtered = Array.isArray(analyses)
    ? analyses.filter((a) =>
        (a?.project_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="inline-block w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#00684A', borderTopColor: 'transparent' }} />
        <span className="ml-2 text-sm" style={{ color: '#5C6C75' }}>Loading history...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}>
        <FiSearch className="w-4 h-4" style={{ color: '#889397' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project name..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: '#3D4F58' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}>
          <FiFileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#E8EDEB' }} />
          <p className="text-sm" style={{ color: '#5C6C75' }}>
            {search ? 'No analyses match your search' : 'No analyses yet. Run your first analysis!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <button
              key={a._id}
              onClick={() => onSelectAnalysis(a.report_json)}
              className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-[1.005]"
              style={{ background: '#FFFFFF', border: '1px solid #E8EDEB' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: '#001E2B' }}>
                  {a.project_name ?? 'Untitled'}
                </span>
                <div className="flex items-center gap-1">
                  <FiActivity className="w-3 h-3" style={{ color: getScoreColor(a.health_score ?? 0) }} />
                  <span className="text-xs font-bold" style={{ color: getScoreColor(a.health_score ?? 0) }}>
                    {a.health_score ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {Array.isArray(a.languages) && a.languages.map((lang, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E3FCF7', color: '#00684A' }}>
                    {lang}
                  </span>
                ))}
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: getDebtColor(a.tech_debt_level) + '15', color: getDebtColor(a.tech_debt_level) }}>
                  {a.tech_debt_level ?? 'unknown'} debt
                </span>
                <span className="text-xs ml-auto" style={{ color: '#5C6C75' }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
