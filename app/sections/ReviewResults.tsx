'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { FiShield, FiZap, FiCheckCircle, FiArrowLeft, FiAlertTriangle, FiInfo } from 'react-icons/fi'

interface ReviewReport {
  overall_score?: number
  executive_summary?: string
  quality?: {
    score?: number
    issues?: { line?: number; issue?: string; severity?: string; suggestion?: string; category?: string }[]
    inline_comments?: { line?: number; comment?: string; severity?: string }[]
    summary?: string
  }
  security?: {
    score?: number
    vulnerabilities?: { type?: string; severity?: string; location?: string; description?: string; fix?: string; cwe_id?: string }[]
    critical_count?: number
    high_count?: number
    medium_count?: number
    low_count?: number
    summary?: string
  }
  performance?: {
    score?: number
    issues?: { type?: string; impact?: string; location?: string; description?: string; recommendation?: string; estimated_improvement?: string }[]
    complexity_analysis?: { time_complexity?: string; space_complexity?: string }
    summary?: string
  }
  action_items?: { priority?: string; category?: string; description?: string; location?: string }[]
  total_issues?: number
  language_detected?: string
}

interface ReviewResultsProps {
  report: ReviewReport
  onBack: () => void
}

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2
  const circumference = 2 * Math.PI * r
  const progress = ((score ?? 0) / 100) * circumference
  const color = (score ?? 0) >= 71 ? '#00ED64' : (score ?? 0) >= 41 ? '#FFC010' : '#FF6961'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1C3D4F" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-medium" style={{ color }}>{score ?? 0}</span>
        <span className="text-[10px] text-[#6B7C85]">/ 100</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity?: string }) {
  const s = (severity ?? '').toLowerCase()
  const styles: Record<string, string> = {
    critical: 'bg-[#FF6961] text-white',
    high: 'bg-[#FFC010] text-[#001E2B]',
    medium: 'bg-[#0498EC] text-white',
    low: 'bg-[#243D4D] text-[#A5B2B5]',
  }
  return <Badge className={`text-[10px] font-medium ${styles[s] ?? 'bg-[#243D4D] text-[#889397]'}`}>{severity ?? 'unknown'}</Badge>
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1 text-white">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1 text-white">{line.slice(3)}</h3>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm text-[#A5B2B5]">{line.slice(2)}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-[#A5B2B5]">{line}</p>
      })}
    </div>
  )
}

export default function ReviewResults({ report, onBack }: ReviewResultsProps) {
  const qualityIssues = Array.isArray(report?.quality?.issues) ? report.quality.issues : []
  const inlineComments = Array.isArray(report?.quality?.inline_comments) ? report.quality.inline_comments : []
  const vulnerabilities = Array.isArray(report?.security?.vulnerabilities) ? report.security.vulnerabilities : []
  const perfIssues = Array.isArray(report?.performance?.issues) ? report.performance.issues : []
  const actionItems = Array.isArray(report?.action_items) ? report.action_items : []

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-[#889397] hover:text-white rounded-lg">
          <FiArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-medium text-white">Review Results</h2>
          {report?.language_detected && <span className="text-xs text-[#6B7C85]">Language: {report.language_detected}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg flex flex-col items-center justify-center py-6">
          <ScoreGauge score={report?.overall_score ?? 0} />
          <p className="text-xs text-[#889397] mt-2">Overall Score</p>
          <p className="text-xs text-[#6B7C85]">{report?.total_issues ?? 0} issues found</p>
        </Card>
        {[
          { label: 'Quality', score: report?.quality?.score, icon: FiCheckCircle, color: '#00ED64' },
          { label: 'Security', score: report?.security?.score, icon: FiShield, color: '#FF6961' },
          { label: 'Performance', score: report?.performance?.score, icon: FiZap, color: '#FFC010' },
        ].map((item) => (
          <Card key={item.label} className="bg-[#112733] border-[#1C3D4F] rounded-lg flex flex-col items-center justify-center py-6">
            <ScoreGauge score={item.score ?? 0} size={80} />
            <div className="flex items-center gap-1.5 mt-2">
              <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
              <p className="text-xs text-[#889397]">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {report?.executive_summary && (
        <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm font-medium">Executive Summary</CardTitle></CardHeader>
          <CardContent>{renderMarkdown(report.executive_summary)}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="bg-[#112733] border border-[#1C3D4F] rounded-lg p-1 w-full justify-start">
          <TabsTrigger value="quality" className="rounded-md data-[state=active]:bg-[#00ED64] data-[state=active]:text-[#001E2B] text-[#889397] text-sm gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5" /> Quality ({qualityIssues.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-md data-[state=active]:bg-[#00ED64] data-[state=active]:text-[#001E2B] text-[#889397] text-sm gap-1.5">
            <FiShield className="w-3.5 h-3.5" /> Security ({vulnerabilities.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-md data-[state=active]:bg-[#00ED64] data-[state=active]:text-[#001E2B] text-[#889397] text-sm gap-1.5">
            <FiZap className="w-3.5 h-3.5" /> Performance ({perfIssues.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="rounded-md data-[state=active]:bg-[#00ED64] data-[state=active]:text-[#001E2B] text-[#889397] text-sm gap-1.5">
            <FiAlertTriangle className="w-3.5 h-3.5" /> Actions ({actionItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quality">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardContent className="p-4">
              {report?.quality?.summary && <div className="mb-4">{renderMarkdown(report.quality.summary)}</div>}
              <ScrollArea className="max-h-[400px]">
                {qualityIssues.length === 0 ? (
                  <p className="text-sm text-[#889397] text-center py-6">No quality issues found</p>
                ) : (
                  <div className="space-y-3">
                    {qualityIssues.map((issue, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0A1E29] border border-[#243D4D]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <SeverityBadge severity={issue.severity} />
                          {issue.category && <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{issue.category}</Badge>}
                          {issue.line != null && <span className="text-[10px] text-[#6B7C85] font-mono">Line {issue.line}</span>}
                        </div>
                        <p className="text-sm text-white">{issue.issue ?? ''}</p>
                        {issue.suggestion && <p className="text-xs text-[#00ED64] mt-1.5"><FiInfo className="w-3 h-3 inline mr-1" />{issue.suggestion}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {inlineComments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1C3D4F]">
                  <h4 className="text-sm font-medium text-white mb-3">Inline Comments</h4>
                  <div className="space-y-2">
                    {inlineComments.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-[#6B7C85] font-mono min-w-[50px]">Line {c.line ?? '?'}</span>
                        <SeverityBadge severity={c.severity} />
                        <span className="text-white">{c.comment ?? ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardContent className="p-4">
              {report?.security?.summary && <div className="mb-4">{renderMarkdown(report.security.summary)}</div>}
              <div className="flex gap-3 mb-4 flex-wrap">
                {[
                  { label: 'Critical', count: report?.security?.critical_count, color: 'bg-[#FF6961]' },
                  { label: 'High', count: report?.security?.high_count, color: 'bg-[#FFC010]' },
                  { label: 'Medium', count: report?.security?.medium_count, color: 'bg-[#0498EC]' },
                  { label: 'Low', count: report?.security?.low_count, color: 'bg-[#243D4D]' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs text-[#889397]">{item.label}: {item.count ?? 0}</span>
                  </div>
                ))}
              </div>
              <ScrollArea className="max-h-[400px]">
                {vulnerabilities.length === 0 ? (
                  <p className="text-sm text-[#889397] text-center py-6">No security vulnerabilities found</p>
                ) : (
                  <div className="space-y-3">
                    {vulnerabilities.map((vuln, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0A1E29] border border-[#243D4D]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <SeverityBadge severity={vuln.severity} />
                          {vuln.type && <span className="text-xs text-[#0498EC] font-medium">{vuln.type}</span>}
                          {vuln.cwe_id && <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{vuln.cwe_id}</Badge>}
                        </div>
                        {vuln.location && <p className="text-[10px] text-[#6B7C85] font-mono mb-1">{vuln.location}</p>}
                        <p className="text-sm text-white">{vuln.description ?? ''}</p>
                        {vuln.fix && <p className="text-xs text-[#00ED64] mt-1.5"><FiInfo className="w-3 h-3 inline mr-1" />{vuln.fix}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardContent className="p-4">
              {report?.performance?.summary && <div className="mb-4">{renderMarkdown(report.performance.summary)}</div>}
              {report?.performance?.complexity_analysis && (
                <div className="flex gap-4 mb-4 p-3 rounded-lg bg-[#0A1E29] border border-[#243D4D]">
                  <div><span className="text-[10px] text-[#6B7C85] uppercase">Time</span><p className="text-sm text-[#0498EC] font-mono">{report.performance.complexity_analysis.time_complexity ?? 'N/A'}</p></div>
                  <div><span className="text-[10px] text-[#6B7C85] uppercase">Space</span><p className="text-sm text-[#0498EC] font-mono">{report.performance.complexity_analysis.space_complexity ?? 'N/A'}</p></div>
                </div>
              )}
              <ScrollArea className="max-h-[400px]">
                {perfIssues.length === 0 ? (
                  <p className="text-sm text-[#889397] text-center py-6">No performance issues found</p>
                ) : (
                  <div className="space-y-3">
                    {perfIssues.map((issue, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0A1E29] border border-[#243D4D]">
                        <div className="flex items-center gap-2 mb-1.5">
                          {issue.type && <Badge className="text-[10px] bg-[#FFC010] text-[#001E2B]">{issue.type}</Badge>}
                          {issue.impact && <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{issue.impact}</Badge>}
                        </div>
                        {issue.location && <p className="text-[10px] text-[#6B7C85] font-mono mb-1">{issue.location}</p>}
                        <p className="text-sm text-white">{issue.description ?? ''}</p>
                        {issue.recommendation && <p className="text-xs text-[#00ED64] mt-1.5"><FiInfo className="w-3 h-3 inline mr-1" />{issue.recommendation}</p>}
                        {issue.estimated_improvement && <p className="text-[10px] text-[#0498EC] mt-1">Est. improvement: {issue.estimated_improvement}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardContent className="p-4">
              <ScrollArea className="max-h-[400px]">
                {actionItems.length === 0 ? (
                  <p className="text-sm text-[#889397] text-center py-6">No action items</p>
                ) : (
                  <div className="space-y-2">
                    {actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A1E29] border border-[#243D4D]">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${(item.priority ?? '').toLowerCase() === 'high' ? 'bg-[#FF6961]' : (item.priority ?? '').toLowerCase() === 'medium' ? 'bg-[#FFC010]' : 'bg-[#0498EC]'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{item.priority ?? 'normal'}</Badge>
                            {item.category && <Badge variant="outline" className="text-[10px] border-[#243D4D] text-[#889397]">{item.category}</Badge>}
                          </div>
                          <p className="text-sm text-white">{item.description ?? ''}</p>
                          {item.location && <p className="text-[10px] text-[#6B7C85] font-mono mt-1">{item.location}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
