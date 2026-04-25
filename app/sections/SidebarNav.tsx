'use client'

import { FiGrid, FiPlus, FiClock, FiSettings, FiCpu, FiChevronLeft } from 'react-icons/fi'

type View = 'dashboard' | 'new-review' | 'results' | 'history' | 'settings'

interface SidebarNavProps {
  currentView: View
  onNavigate: (view: View) => void
  collapsed: boolean
  onCollapse: () => void
}

const NAV_ITEMS: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'new-review', label: 'New Review', icon: FiPlus },
  { id: 'history', label: 'History', icon: FiClock },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

const AGENTS = [
  { name: 'Code Review Coordinator', role: 'Manager' },
  { name: 'Code Quality Agent', role: 'Sub-agent' },
  { name: 'Security Analyst Agent', role: 'Sub-agent' },
  { name: 'Performance Optimizer Agent', role: 'Sub-agent' },
]

export default function SidebarNav({ currentView, onNavigate, collapsed, onCollapse }: SidebarNavProps) {
  return (
    <aside
      className={`${collapsed ? 'w-0 overflow-hidden' : 'w-60'} transition-all duration-300 bg-[#001E2B] border-r border-[#1C3D4F] flex flex-col h-full`}
    >
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#00ED64] text-[#001E2B]' : 'text-[#A5B2B5] hover:bg-[#1C3D4F] hover:text-white'}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[#1C3D4F]">
        <div className="flex items-center gap-2 mb-2 px-2">
          <FiCpu className="w-3.5 h-3.5 text-[#6B7C85]" />
          <span className="text-xs font-medium text-[#6B7C85] uppercase tracking-wider">Agents</span>
        </div>
        {AGENTS.map((agent) => (
          <div key={agent.name} className="flex items-center gap-2 px-2 py-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${agent.role === 'Manager' ? 'bg-[#00ED64]' : 'bg-[#0498EC]'}`} />
            <span className="text-xs text-[#889397] truncate">{agent.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onCollapse}
        className="p-3 border-t border-[#1C3D4F] flex items-center gap-2 text-[#889397] hover:text-white transition-colors"
      >
        <FiChevronLeft className="w-4 h-4" />
        <span className="text-xs">Collapse</span>
      </button>
    </aside>
  )
}
