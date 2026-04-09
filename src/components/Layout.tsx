import React from 'react';
import { useVms } from '../context/VmsContext';
import { Building2, Folder, LayoutDashboard, Settings, LogOut, Users, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Login } from './Login';

export function Layout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useVms();
  const { currentUser } = state;

  if (!currentUser) {
    return <Login />;
  }

  const isVendor = currentUser.type === 'Vendor';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel flex flex-col border-r border-white/10 z-10">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border",
            isVendor ? "bg-purple-500/20 border-purple-500/50" : "bg-cyan-500/20 border-cyan-500/50"
          )}>
            <Building2 className={cn("w-5 h-5", isVendor ? "text-purple-400" : "text-cyan-400")} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">
            {isVendor ? 'Vendor' : 'VMS'}<span className={isVendor ? "text-purple-400" : "text-cyan-400"}>.portal</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {!isVendor && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Main Menu</h2>
              <div className="space-y-1">
                <button
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'tasks' })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    state.currentTab === 'tasks'
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Active Tasks
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'directory' })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    state.currentTab === 'directory'
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  Vendor Directory
                </button>
              </div>
            </div>
          )}

          {isVendor && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Vendor Menu</h2>
              <div className="space-y-1">
                <button
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'tasks' })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    state.currentTab === 'tasks'
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Available Tasks
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center",
                isVendor ? "bg-purple-900/50 border-purple-700" : "bg-gray-800 border-gray-700"
              )}>
                <span className="text-xs font-bold">{currentUser.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {isVendor ? state.vendors.find(v => v.id === currentUser.vendorId)?.companyName : `${currentUser.department} • ${currentUser.role}`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => dispatch({ type: 'SET_USER', payload: null })}
              className="text-gray-500 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-white">
            {isVendor 
              ? 'Vendor Portal' 
              : `${currentUser.department} Dashboard`}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Removed view switcher as we now use the login screen */}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 z-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
