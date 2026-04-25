'use client'

import { FiEye } from 'react-icons/fi'
import { UserMenu } from 'lyzr-architect/client'

interface HeaderProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analyze', label: 'New Analysis' },
    { id: 'history', label: 'History' },
  ]

  return (
    <header className="border-b" style={{ borderColor: '#E8EDEB', background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FiEye className="w-6 h-6" style={{ color: '#00684A' }} />
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#001E2B' }}>
              Code <span style={{ color: '#00684A' }}>Lens</span>
            </h1>
          </div>
          <p className="text-xs hidden md:block" style={{ color: '#5C6C75' }}>
            Deep Code Analysis & Insights Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
                style={{
                  background: currentView === item.id ? '#E3FCF7' : 'transparent',
                  color: currentView === item.id ? '#00684A' : '#5C6C75',
                  border: currentView === item.id ? '1px solid #C1E7D8' : '1px solid transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
