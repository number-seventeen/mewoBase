import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Database, Settings, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { MagicalBackground } from './MagicalBackground';

export function Layout() {
  const location = useLocation();

  return (
    <>
      <MagicalBackground />
      <div className="flex flex-col h-screen overflow-hidden bg-transparent text-foreground relative z-10">
        {/* Top Header */}
        <header className="h-[80px] border-b border-border/20 glass-panel rounded-none flex items-center justify-between px-6 z-20 relative w-full" style={{ WebkitAppRegion: 'drag' } as any}>
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm mt-1">
              M
            </div>
            <span className="text-xl font-bold tracking-tight mt-1">MewoBase</span>
            <div className="h-6 w-px bg-border/40 mx-4"></div>
            <h1 className="font-bold text-lg tracking-wider text-foreground drop-shadow-md select-none mt-1">
              {location.pathname.startsWith('/knowledge') ? 'DATA MODULES TRAINING' : 
               location.pathname === '/settings' ? 'SYSTEM SETTINGS' : 'NEURAL INTERFACE'}
            </h1>
          </div>
          
          {/* Right: Navigation Menu and Status */}
          <div className="flex items-center gap-6" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <nav className="flex items-center gap-2">
              <Link
                to="/chat"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium",
                  location.pathname.startsWith('/chat')
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <MessageSquare size={16} />
                <span>AI Chat</span>
              </Link>
              <Link
                to="/knowledge"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium",
                  location.pathname.startsWith('/knowledge')
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Database size={16} />
                <span>Knowledge Bases</span>
              </Link>
              <Link
                to="/settings"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium",
                  location.pathname === '/settings' 
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="flex items-center gap-4 text-sm font-bold tracking-widest text-[#10b981] mt-1">
              <span className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-full text-[10px] uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Magic Online
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 overflow-auto no-scrollbar">
          <Outlet />
        </main>
      </div>
    </>
  );
}
