"use client";

import ClientsDialog from './ClientsDialog'; // Adjust the path as needed
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import RequestDocumentsDialog from "./reqDoc";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Clock, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  MoreHorizontal,
  Bell,
  Zap,
  Target,
  Globe,
  LogOut
} from "lucide-react";
import Logout from "./logout";

export default function Dashboard() {

  const {user} = useUser();

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("7d");
  const [showClientsDialog, setShowClientsDialog] = useState(false);


  useEffect(() => {
    async function fetchClients() {
      if (!user) { // Add this check
        setLoading(false); // Ensure loading is set to false if user is not available
        return; // Exit the function if user is undefined
      }
      const userId = user.id; // Remove await
      try {
        const res = await fetch(`http://localhost:3000/getClients/${userId}`);
        const data: { clients: any[] } = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [user]); // Add user to the dependency array

  // Mock data for dashboard analytics
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    pendingDocuments: clients.filter(c => c.status === 'pending').length,
    completedDeals: 24,
    revenue: 156200,
    revenueGrowth: 12.5,
    clientGrowth: 8.2,
    documentRequests: 48,
    avgResponseTime: "2.4h"
  };

  const recentActivity = [
    { id: 1, type: 'client_added', message: 'New client "TechCorp Inc." added', time: '2 minutes ago', icon: Users, color: 'text-blue-400' },
    { id: 2, type: 'document_requested', message: 'Documents requested from Acme Solutions', time: '15 minutes ago', icon: FileText, color: 'text-amber-400' },
    { id: 3, type: 'deal_closed', message: 'Deal closed with Global Dynamics - $25,000', time: '1 hour ago', icon: DollarSign, color: 'text-emerald-400' },
    { id: 4, type: 'status_updated', message: 'Client status updated to "Active"', time: '2 hours ago', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 5, type: 'alert', message: 'Follow-up required for 3 pending clients', time: '4 hours ago', icon: AlertCircle, color: 'text-red-400' },
  ];

  const quickActions = [
    { title: 'Add New Client', icon: Users, color: 'from-blue-600 to-blue-500', description: 'Onboard a new client' },
    { title: 'Generate Report', icon: BarChart3, color: 'from-purple-600 to-purple-500', description: 'Create analytics report' },
    { title: 'Schedule Meeting', icon: Calendar, color: 'from-emerald-600 to-emerald-500', description: 'Book client meeting' },
    { title: 'Send Reminders', icon: Bell, color: 'from-amber-600 to-amber-500', description: 'Notify pending clients' },
  ];

  if (loading) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Dashboard Overview {user?.fullName}
            </h1>
            <p className="text-slate-400 mt-2">Welcome back! Here's what's happening with your business today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
              <Calendar className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Logout></Logout>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Clients</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+{stats.clientGrowth}%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+{stats.revenueGrowth}%</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Deals</p>
                  <p className="text-2xl font-bold text-white">{stats.completedDeals}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm">{stats.avgResponseTime} avg</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Docs</p>
                  <p className="text-2xl font-bold text-white">{stats.documentRequests}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{stats.pendingDocuments} urgent</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Clients Table */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Clients</h3>
                  <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-700  hover:text-slate-400 hover:border-slate-600"
                        onClick={() => setShowClientsDialog(true)}>
                          View All
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                
                </div>
                
                <div className="overflow-hidden rounded-lg border border-slate-700/50">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-300 font-medium">Client</th>
                        <th className="px-4 py-3 text-left text-slate-300 font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-slate-300 font-medium">Status</th>
                        <th className="px-4 py-3 text-center text-slate-300 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {clients.slice(0, 5).map((client, i) => (
                        <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {client.company?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-white">{client.client_name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-blue-400">{client.client_email}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                              client.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            )}>
                              {client.status || 'none'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <RequestDocumentsDialog clientName={client.client_name} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Activity className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <div className={`p-2 rounded-lg bg-slate-700/50`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{activity.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <Zap className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="group p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ClientsDialog 
                    clients={clients}
                    isOpen={showClientsDialog}
                    onClose={() => setShowClientsDialog(false)}
                />
    </div>
  );
}