import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, BrainCircuit, Database, History, Info, Activity, FileText } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar() {
  const [health, setHealth] = useState({ status: 'checking', best_model: null });

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      const res = await checkHealth();
      if (mounted) {
        setHealth(res);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Detector', icon: ShieldCheck },
    { to: '/models', label: 'Models', icon: BrainCircuit },
    { to: '/dataset', label: 'Dataset', icon: Database },
    { to: '/history', label: 'History', icon: History },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0F291E] flex items-center justify-center text-[#E2F0D9] shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-heading text-2xl font-bold tracking-tight text-[#0F291E]">TruthLens</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#E8EDE4] text-[#22543D]">NLP XAI</span>
              </div>
              <p className="text-[11px] text-[#5C6E64] font-medium tracking-wide">Explainable Fake News Detection</p>
            </div>
          </NavLink>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#EAE4D7] text-[#0F291E] font-semibold shadow-xs'
                      : 'text-[#4A5568] hover:text-[#0F291E] hover:bg-[#F2ECE0]'
                  }`
                }
              >
                <Icon className="w-4 h-4 opacity-75" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* System Health Status Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E7E2D9] shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  health.status === 'healthy'
                    ? 'bg-emerald-500 animate-pulse'
                    : health.status === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-[#334155] font-medium hidden sm:inline">
                {health.status === 'healthy'
                  ? `ML Engine: ${health.best_model || 'Active'}`
                  : health.status === 'checking'
                  ? 'Connecting...'
                  : 'Backend Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
