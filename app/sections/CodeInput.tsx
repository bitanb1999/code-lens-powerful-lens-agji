'use client'

import { useState } from 'react'
import { FiZap, FiCode } from 'react-icons/fi'

interface CodeInputProps {
  onAnalyze: (code: string, projectName: string) => void
  loading: boolean
  sampleMode: boolean
}

const SAMPLE_CODE = `// Express API Server
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
  async register(req, res) {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // TODO: Add rate limiting
    // TODO: Add refresh token support
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  }
}

function validateEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function formatResponse(data, status = 200) {
  return { status, data, timestamp: new Date().toISOString() };
}

const app = express();
app.use(express.json());
app.post('/register', (req, res) => new UserController().register(req, res));
app.post('/login', (req, res) => new UserController().login(req, res));
app.listen(3000, () => console.log('Server running'));`

export default function CodeInput({ onAnalyze, loading, sampleMode }: CodeInputProps) {
  const [code, setCode] = useState('')
  const [projectName, setProjectName] = useState('')

  const displayCode = sampleMode ? SAMPLE_CODE : code
  const displayName = sampleMode ? 'Express Auth API' : projectName

  const handleAnalyze = () => {
    if (!displayCode.trim()) return
    onAnalyze(displayCode, displayName)
  }

  return (
    <div className="rounded-lg border p-4" style={{ background: '#FFFFFF', borderColor: '#E8EDEB' }}>
      <div className="flex items-center gap-2 mb-3">
        <FiCode className="w-4 h-4" style={{ color: '#00684A' }} />
        <h2 className="text-sm font-semibold" style={{ color: '#001E2B' }}>Paste Your Code</h2>
      </div>
      <div className="mb-3">
        <label className="block text-xs mb-1" style={{ color: '#5C6C75' }}>Project Name (optional)</label>
        <input
          type="text"
          value={sampleMode ? displayName : projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My Project"
          disabled={sampleMode}
          className="w-full px-3 py-2 rounded text-sm focus:outline-none"
          style={{
            background: '#FFFFFF',
            border: '1px solid #C1CCC6',
            color: '#3D4F58',
          }}
        />
      </div>
      <textarea
        value={sampleMode ? displayCode : code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        disabled={sampleMode}
        rows={14}
        className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none resize-none"
        style={{
          background: '#F9FBFA',
          border: '1px solid #C1CCC6',
          color: '#3D4F58',
          lineHeight: '1.6',
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: '#5C6C75' }}>
          {displayCode.split('\n').length} lines
        </span>
        <button
          onClick={handleAnalyze}
          disabled={loading || !displayCode.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all duration-200 disabled:opacity-40"
          style={{
            background: loading ? '#FFFFFF' : '#00684A',
            color: loading ? '#00684A' : '#FFFFFF',
            border: loading ? '1px solid #00684A' : 'none',
          }}
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: '#00684A', borderTopColor: 'transparent' }} />
              Analyzing...
            </>
          ) : (
            <>
              <FiZap className="w-4 h-4" />
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  )
}
