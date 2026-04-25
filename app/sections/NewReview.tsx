'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FiPlay, FiLoader } from 'react-icons/fi'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'ruby', 'php', 'csharp', 'swift', 'kotlin']
const STRICTNESS_LEVELS = ['lenient', 'standard', 'strict']
const FOCUS_AREAS = ['quality', 'security', 'performance']

interface NewReviewProps {
  onRunReview: (code: string, language: string, strictness: string, focusAreas: string[]) => void
  loading: boolean
  error: string
}

export default function NewReview({ onRunReview, loading, error }: NewReviewProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [strictness, setStrictness] = useState('standard')
  const [focusAreas, setFocusAreas] = useState<string[]>(['quality', 'security', 'performance'])

  const toggleFocus = (area: string) => {
    setFocusAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }

  const lineCount = code.split('\n').length

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div>
        <h2 className="text-xl font-medium text-white">New Code Review</h2>
        <p className="text-sm text-[#889397] mt-1">Paste your code and configure the review parameters</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-[#FF6961]/10 border border-[#FF6961]/30 text-[#FF6961] text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Code Input</CardTitle>
                <span className="text-xs text-[#6B7C85]">{lineCount} lines</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0A1E29] rounded-l-lg flex flex-col items-center pt-3 text-[10px] text-[#6B7C85] font-mono overflow-hidden select-none">
                  {code.split('\n').map((_, i) => (
                    <div key={i} className="leading-[1.625rem]">{i + 1}</div>
                  ))}
                </div>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[400px] pl-12 font-mono text-sm bg-[#0A1E29] border-[#243D4D] text-white rounded-lg resize-none focus:ring-[#00ED64] focus:border-[#00ED64] leading-[1.625rem]"
                  spellCheck={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Language</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-[#0A1E29] border-[#243D4D] text-white rounded-lg focus:ring-[#00ED64]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#112733] border-[#243D4D]">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-white focus:bg-[#1C3D4F] focus:text-white">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Strictness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 bg-[#0A1E29] rounded-lg p-1">
                {STRICTNESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setStrictness(level)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${strictness === level ? 'bg-[#00ED64] text-[#001E2B]' : 'text-[#889397] hover:text-white'}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Focus Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FOCUS_AREAS.map((area) => (
                <div key={area} className="flex items-center gap-2">
                  <Checkbox
                    id={`focus-${area}`}
                    checked={focusAreas.includes(area)}
                    onCheckedChange={() => toggleFocus(area)}
                    className="border-[#243D4D] data-[state=checked]:bg-[#00ED64] data-[state=checked]:border-[#00ED64] data-[state=checked]:text-[#001E2B]"
                  />
                  <Label htmlFor={`focus-${area}`} className="text-sm text-white cursor-pointer capitalize">{area}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={() => onRunReview(code, language, strictness, focusAreas)}
            disabled={loading || !code.trim()}
            className="w-full bg-[#00ED64] hover:bg-[#00C854] text-[#001E2B] rounded-lg py-5 text-sm font-medium gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><FiLoader className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><FiPlay className="w-4 h-4" /> Run Review</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
