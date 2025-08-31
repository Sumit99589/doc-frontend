"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddClient from "./ui/addClient";
import { 
  Home, 
  Users, 
  Database, 
  Settings, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Building2,
  Activity,
  Bell,
  User
} from "lucide-react";
import Logout from "./logout";

export default function Sidebar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false); // Add this state

  const navItems = [
    { tab: "dashboard", label: "Dashboard", icon: Home },
    { tab: "clients", label: "Clients", icon: Users },
    { tab: "storage", label: "Storage", icon: Database },
  ];

  const NavItem = ({ tab, label, icon: Icon, badge }: { 
    tab: string; 
    label: string; 
    icon: any; 
    badge?: number 
  }) => (
    <Link href={`/${tab}`} key={tab}>
      <button
        className={`group relative flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all duration-200 ${
          pathname === `/${tab}`
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        }`}
        onClick={() => setActiveTab(tab)}
      >
        <Icon className={`w-5 h-5 transition-colors ${
          pathname === `/${tab}` ? "text-white" : "group-hover:text-white"
        }`} />
        {!isCollapsed && (
          <>
            <span className="font-medium">{label}</span>
            {badge && badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {badge}
              </span>
            )}
          </>
        )}
        {pathname === `/${tab}` && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full opacity-50"></div>
        )}
      </button>
    </Link>
  );

  return (
    <>
      <aside className={`${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 flex flex-col min-h-screen bg-slate-900 border-r border-slate-700/50 relative`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Acme Co
                  </h1>
                  <p className="text-xs text-slate-400">Professional Dashboard</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Stats Card */}
          {!isCollapsed && (
            <div className="mb-6 p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm border border-slate-600/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-white">System Status</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">All systems operational</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                Navigation
              </p>
            )}
            
            {navItems.map((item) => (
              <NavItem
                key={item.tab}
                tab={item.tab}
                label={item.label}
                icon={item.icon}
                badge={item.tab === 'clients' ? 3 : undefined}
              />
            ))}

            {/* Add Client Section */}
            {!isCollapsed && (
              <>
                <div className="pt-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                    Quick Actions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button 
                    className="group flex items-center gap-3 w-full p-3 rounded-xl text-left text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    onClick={() => setShowAddClient(true)} // Add onClick handler
                  >
                    <Plus className="w-5 h-5 group-hover:text-white transition-colors" />
                    <span className="font-medium">Add Client</span>
                  </button>
                </div>
              </>
            )}
          </nav>

          {/* Notifications */}
          {!isCollapsed && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-amber-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-400">New Update Available</p>
                  <p className="text-xs text-slate-400 mt-1">Version 2.1.0 includes new features and bug fixes.</p>
                  <button className="text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className={`mt-auto pt-6 border-t border-slate-700/50 ${isCollapsed ? 'px-0' : ''}`}>
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">John Doe</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
                
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              
            )}
          </div>
        </div>
      </aside>

      {/* Conditionally render AddClient component */}
      {showAddClient && (
        <AddClient onClose={() => setShowAddClient(false)}
        isOpen={showAddClient} />
      )}
    </>
  );
}