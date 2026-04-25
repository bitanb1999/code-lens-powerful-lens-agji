'use client'

import { useState } from 'react'
import {
  FiActivity, FiZap, FiLayers, FiCode, FiAlertTriangle,
  FiPackage, FiCopy, FiCheckCircle, FiChevronDown, FiChevronRight,
  FiTerminal, FiFileText, FiList, FiDownload
} from 'react-icons/fi'
import { copyToClipboard } from '@/lib/clipboard'

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

interface AnalysisResultsProps {
  report: CodeLensReport | null
  onExportJSON: () => void
  onExportText: () => void
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00684A'
  if (score >= 60) return '#FFC010'
  if (score >= 40) return '#E06F00'
  return '#CF4C35'
}

function getSeverityColor(sev: string): string {
  const s = (sev ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return '#CF4C35'
  if (s === 'medium') return '#E06F00'
  return '#00684A'
}

function getStatusColor(status: string): string {
  const s = (status ?? '').toLowerCase()
  if (s === 'healthy' || s === 'ok' || s === 'up-to-date' || s === 'up to date') return '#00684A'
  if (s === 'outdated') return '#FFC010'
  if (s === 'vulnerable' || s === 'deprecated') return '#CF4C35'
  return '#3D4F58'
}

function getDebtColor(level: string): string {
  const l = (level ?? '').toLowerCase()
  if (l === 'low') return '#00684A'
  if (l === 'medium' || l === 'moderate') return '#FFC010'
  return '#CF4C35'
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1" style={{ color: '#001E2B' }}>{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1" style={{ color: '#001E2B' }}>{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1" style={{ color: '#001E2B' }}>{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm" style={{ color: '#3D4F58' }}>{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm" style={{ color: '#3D4F58' }}>{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm" style={{ color: '#3D4F58' }}>{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold" style={{ color: '#001E2B' }}>{part}</strong> : part)
}

export default function AnalysisResults({ report, onExportJSON, onExportText }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  if (!report) return null

  const score = report.health_score ?? 0
  const scoreColor = getScoreColor(score)
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'structure', label: 'Structure', icon: FiLayers },
    { id: 'entities', label: 'Code Entities', icon: FiCode },
    { id: 'debt', label: 'Tech Debt', icon: FiAlertTriangle },
    { id: 'deps', label: 'Dependencies', icon: FiPackage },
    { id: 'llm', label: 'LLM Context', icon: FiTerminal },
  ]

  const handleCopyLLM = async () => {
    if (report.llm_context) {
      await copyToClipboard(report.llm_context)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-lg border" style={{ background: '#FFFFFF', borderColor: '#E8EDEB' }}>
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto" style={{ borderColor: '#E8EDEB' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.id ? '#E3FCF7' : 'transparent',
                color: activeTab === tab.id ? '#00684A' : '#5C6C75',
                border: activeTab === tab.id ? '1px solid #C1E7D8' : '1px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E8EDEB" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${score * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
                  </div>
                </div>
                <span className="text-xs mt-1" style={{ color: '#5C6C75' }}>Health Score</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold" style={{ color: '#001E2B' }}>{report.project_name ?? 'Unnamed Project'}</h3>
                <p className="text-xs" style={{ color: '#5C6C75' }}>{report.architecture ?? 'Unknown architecture'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(report.languages) && report.languages.map((lang, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: '#E3FCF7', color: '#00684A', border: '1px solid #C1E7D8' }}>{lang}</span>
                  ))}
                </div>
              </div>
            </div>
            {Array.isArray(report.key_insights) && report.key_insights.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#00684A' }}>
                  <FiZap className="w-3.5 h-3.5" /> Key Insights
                </h4>
                <ul className="space-y-1.5">
                  {report.key_insights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#3D4F58' }}>
                      <FiChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#00684A' }} />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.executive_summary && (
              <div className="rounded p-3" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#00684A' }}>
                  <FiFileText className="w-3.5 h-3.5" /> Executive Summary
                </h4>
                {renderMarkdown(report.executive_summary)}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={onExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all" style={{ border: '1px solid #C1E7D8', color: '#00684A', background: 'transparent' }}>
                <FiDownload className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button onClick={onExportText} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all" style={{ border: '1px solid #C1E7D8', color: '#00684A', background: 'transparent' }}>
                <FiFileText className="w-3.5 h-3.5" /> Export Text
              </button>
              <button onClick={handleCopyLLM} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all" style={{ border: '1px solid #C1E7D8', color: copied ? '#FFFFFF' : '#00684A', background: copied ? '#00684A' : 'transparent' }}>
                {copied ? <><FiCheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><FiCopy className="w-3.5 h-3.5" /> Copy LLM Context</>}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-4">
            {Array.isArray(report.structure?.modules) && report.structure.modules.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Modules</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                        <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Name</th>
                        <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Purpose</th>
                        <th className="text-right py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.structure.modules.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#00684A' }}>{m?.name}</td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{m?.purpose}</td>
                          <td className="py-1.5 px-2 text-xs text-right" style={{ color: '#001E2B' }}>{m?.file_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {Array.isArray(report.structure?.entry_points) && report.structure.entry_points.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Entry Points</h4>
                <div className="space-y-1">
                  {report.structure.entry_points.map((ep, i) => (
                    <div key={i} className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#F9FBFA', color: '#00684A' }}>{ep}</div>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(report.structure?.conventions) && report.structure.conventions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Conventions</h4>
                <ul className="space-y-1">
                  {report.structure.conventions.map((c, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#3D4F58' }}>
                      <FiCheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#00684A' }} /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="rounded p-3 flex-1" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-2xl font-bold" style={{ color: '#00684A' }}>{report.code_entities?.total_functions ?? 0}</span>
                <p className="text-xs" style={{ color: '#5C6C75' }}>Functions</p>
              </div>
              <div className="rounded p-3 flex-1" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-2xl font-bold" style={{ color: '#00684A' }}>{report.code_entities?.total_classes ?? 0}</span>
                <p className="text-xs" style={{ color: '#5C6C75' }}>Classes</p>
              </div>
            </div>
            {Array.isArray(report.code_entities?.functions) && report.code_entities.functions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Functions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Name</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Params</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Returns</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Description</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Module</th>
                    </tr></thead>
                    <tbody>
                      {report.code_entities.functions.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#00684A' }}>{f?.name}</td>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#3D4F58' }}>{f?.params}</td>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#E06F00' }}>{f?.return_type}</td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{f?.description}</td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#5C6C75' }}>{f?.module}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {Array.isArray(report.code_entities?.classes) && report.code_entities.classes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Classes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Name</th>
                      <th className="text-right py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Methods</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Description</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Module</th>
                    </tr></thead>
                    <tbody>
                      {report.code_entities.classes.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#00684A' }}>{c?.name}</td>
                          <td className="py-1.5 px-2 text-xs text-right" style={{ color: '#001E2B' }}>{c?.methods_count}</td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{c?.description}</td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#5C6C75' }}>{c?.module}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {Array.isArray(report.code_entities?.design_patterns) && report.code_entities.design_patterns.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Design Patterns</h4>
                <div className="flex flex-wrap gap-1.5">
                  {report.code_entities.design_patterns.map((p, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: '#E3FCF7', color: '#00684A', border: '1px solid #C1E7D8' }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'debt' && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="rounded p-3 flex-1 min-w-[120px]" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: getDebtColor(report.tech_debt?.level ?? '') + '20', color: getDebtColor(report.tech_debt?.level ?? '') }}>{report.tech_debt?.level ?? 'N/A'}</span>
                <p className="text-xs mt-1" style={{ color: '#5C6C75' }}>Debt Level</p>
              </div>
              <div className="rounded p-3 flex-1 min-w-[120px]" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-2xl font-bold" style={{ color: '#FFC010' }}>{report.tech_debt?.score ?? 0}</span>
                <p className="text-xs" style={{ color: '#5C6C75' }}>Debt Score</p>
              </div>
              <div className="rounded p-3 flex-1 min-w-[120px]" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-2xl font-bold" style={{ color: '#FFC010' }}>{report.tech_debt?.todos_count ?? 0}</span>
                <p className="text-xs" style={{ color: '#5C6C75' }}>TODOs</p>
              </div>
              <div className="rounded p-3 flex-1 min-w-[120px]" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB' }}>
                <span className="text-2xl font-bold" style={{ color: '#CF4C35' }}>{report.tech_debt?.code_smells_count ?? 0}</span>
                <p className="text-xs" style={{ color: '#5C6C75' }}>Code Smells</p>
              </div>
            </div>
            {Array.isArray(report.tech_debt?.top_issues) && report.tech_debt.top_issues.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Top Issues</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Issue</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Severity</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Location</th>
                    </tr></thead>
                    <tbody>
                      {report.tech_debt.top_issues.map((issue, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{issue?.issue}</td>
                          <td className="py-1.5 px-2"><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: getSeverityColor(issue?.severity ?? '') + '20', color: getSeverityColor(issue?.severity ?? '') }}>{issue?.severity}</span></td>
                          <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#5C6C75' }}>{issue?.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {Array.isArray(report.tech_debt?.remediation) && report.tech_debt.remediation.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: '#00684A' }}>Remediation Plan</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Action</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Priority</th>
                      <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Effort</th>
                    </tr></thead>
                    <tbody>
                      {report.tech_debt.remediation.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{r?.action}</td>
                          <td className="py-1.5 px-2"><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: getSeverityColor(r?.priority ?? '') + '20', color: getSeverityColor(r?.priority ?? '') }}>{r?.priority}</span></td>
                          <td className="py-1.5 px-2 text-xs" style={{ color: '#5C6C75' }}>{r?.effort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deps' && (
          <div>
            {Array.isArray(report.dependencies) && report.dependencies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ borderBottom: '1px solid #E8EDEB' }}>
                    <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Package</th>
                    <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Status</th>
                    <th className="text-left py-2 px-2 text-xs font-medium" style={{ color: '#5C6C75', background: '#F9FBFA' }}>Note</th>
                  </tr></thead>
                  <tbody>
                    {report.dependencies.map((dep, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E8EDEB' }}>
                        <td className="py-1.5 px-2 font-mono text-xs" style={{ color: '#00684A' }}>{dep?.name}</td>
                        <td className="py-1.5 px-2"><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: getStatusColor(dep?.status ?? '') + '20', color: getStatusColor(dep?.status ?? '') }}>{dep?.status}</span></td>
                        <td className="py-1.5 px-2 text-xs" style={{ color: '#3D4F58' }}>{dep?.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-center py-8" style={{ color: '#5C6C75' }}>No dependencies found</p>
            )}
          </div>
        )}

        {activeTab === 'llm' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#00684A' }}>
                <FiTerminal className="w-3.5 h-3.5" /> LLM-Optimized Context
              </h4>
              <button onClick={handleCopyLLM} className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all" style={{ border: '1px solid #C1E7D8', color: copied ? '#FFFFFF' : '#00684A', background: copied ? '#00684A' : 'transparent' }}>
                {copied ? <><FiCheckCircle className="w-3 h-3" /> Copied!</> : <><FiCopy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <p className="text-xs" style={{ color: '#5C6C75' }}>Feed this to ChatGPT, Claude, or any LLM for instant codebase understanding.</p>
            <div className="rounded p-3 font-mono text-xs overflow-auto max-h-96" style={{ background: '#F9FBFA', border: '1px solid #E8EDEB', color: '#3D4F58', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {report.llm_context ?? 'No LLM context available'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
