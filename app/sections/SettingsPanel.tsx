'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FiSave, FiLoader, FiCheck } from 'react-icons/fi'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'ruby', 'php', 'csharp', 'swift', 'kotlin']
const STRICTNESS_LEVELS = ['lenient', 'standard', 'strict']
const FOCUS_AREAS = ['quality', 'security', 'performance']

export default function SettingsPanel() {
  const [defaultLanguage, setDefaultLanguage] = useState('javascript')
  const [strictness, setStrictness] = useState('standard')
  const [focusAreas, setFocusAreas] = useState<string[]>(['quality', 'security', 'performance'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success && data.data) {
        setDefaultLanguage(data.data.default_language ?? 'javascript')
        setStrictness(data.data.strictness_level ?? 'standard')
        setFocusAreas(Array.isArray(data.data.focus_areas) ? data.data.focus_areas : ['quality', 'security', 'performance'])
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_language: defaultLanguage, strictness_level: strictness, focus_areas: focusAreas })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Settings saved successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleFocus = (area: string) => {
    setFocusAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="w-6 h-6 text-[#00ED64] animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div>
        <h2 className="text-xl font-medium text-white">Settings</h2>
        <p className="text-sm text-[#889397] mt-1">Configure your default review preferences</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-[#FF6961]/10 border border-[#FF6961]/30 text-[#FF6961] text-sm">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/30 text-[#00ED64] text-sm flex items-center gap-2"><FiCheck className="w-4 h-4" />{success}</div>}

      <div className="max-w-lg space-y-6">
        <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Default Language</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
              <SelectTrigger className="bg-[#0A1E29] border-[#243D4D] text-white rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#112733] border-[#243D4D]">
                {LANGUAGES.map(l => (
                  <SelectItem key={l} value={l} className="text-white focus:bg-[#1C3D4F] focus:text-white">
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Strictness Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 bg-[#0A1E29] rounded-lg p-1">
              {STRICTNESS_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setStrictness(level)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${strictness === level ? 'bg-[#00ED64] text-[#001E2B]' : 'text-[#889397] hover:text-white'}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#6B7C85] mt-2">
              {strictness === 'lenient' ? 'Only flags critical issues' : strictness === 'strict' ? 'Flags all issues including minor style suggestions' : 'Balanced review of important issues'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#112733] border-[#1C3D4F] rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Default Focus Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FOCUS_AREAS.map(area => (
              <div key={area} className="flex items-center gap-2">
                <Checkbox
                  id={`settings-focus-${area}`}
                  checked={focusAreas.includes(area)}
                  onCheckedChange={() => toggleFocus(area)}
                  className="border-[#243D4D] data-[state=checked]:bg-[#00ED64] data-[state=checked]:border-[#00ED64] data-[state=checked]:text-[#001E2B]"
                />
                <Label htmlFor={`settings-focus-${area}`} className="text-sm text-white cursor-pointer capitalize">{area}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00ED64] hover:bg-[#00C854] text-[#001E2B] rounded-lg py-5 gap-2 font-medium">
          {saving ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving...</> : <><FiSave className="w-4 h-4" /> Save Settings</>}
        </Button>
      </div>
    </div>
  )
}
