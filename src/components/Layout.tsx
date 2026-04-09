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
      <div className="flex h-screen overflow-hidden bg-transparent text-foreground relative z-10">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/20 glass-panel rounded-none flex flex-col z-20 relative">
        <div className="h-[80px] px-6 flex items-center gap-3" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm mt-1">
            M
          </div>
          <span className="text-xl font-bold tracking-tight mt-1">MewoBase</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 mt-2">
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</div>
          <Link
            to="/chat"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-md transition-all text-sm font-medium",
              location.pathname.startsWith('/chat')
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <MessageSquare size={18} />
            <span>AI Chat</span>
          </Link>
          <Link
            to="/knowledge"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-md transition-all text-sm font-medium",
              location.pathname.startsWith('/knowledge')
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Database size={18} />
            <span>Knowledge Bases</span>
          </Link>
          
          <div className="px-3 mb-2 mt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</div>
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-md transition-all text-sm font-medium",
              location.pathname === '/settings' 
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        <header className="h-[80px] border-b border-border/20 flex items-center justify-between px-6 relative z-20 bg-transparent" style={{ WebkitAppRegion: 'drag' } as any}>
          <h1 className="font-bold text-lg tracking-wider text-foreground drop-shadow-md select-none mt-1">
            {location.pathname.startsWith('/knowledge') ? 'DATA MODULES TRAINING' : 
             location.pathname === '/settings' ? 'SYSTEM SETTINGS' : 'NEURAL INTERFACE'}
          </h1>
          <div className="flex items-center gap-4 text-sm font-bold tracking-widest text-[#10b981] mt-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <span className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-full text-[10px] uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Magic Online
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto no-scrollbar relative">
          <Outlet />
        </div>
      </main>
    </div>
    </>
  );
}
