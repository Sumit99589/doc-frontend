"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Users, 
  Mail, 
  Activity,
  Send,
  Upload,
  FolderOpen,
  Building2,
  Phone,
  User
} from "lucide-react";

interface FileSendClient {
  id: string;
  client_name: string;
  company_name: string;
  client_email: string;
  phone_number: string;
  status: 'active' | 'pending' | 'inactive';
}

export default function SendFilesPage() {
  const [clients, setClients] = useState<FileSendClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<FileSendClient | null>(null);
  const [viewingClient, setViewingClient] = useState<FileSendClient | null>(null);
  const [showSendFilesModal, setShowSendFilesModal] = useState<FileSendClient | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      if (!user) {
        setLoading(false);
        return;
      }
      const userId = user.id;
      try {
        const res = await fetch(`http://localhost:3000/getFileSendClients/${userId}`);
        const data: { clients: FileSendClient[] } = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error("Error fetching file send clients:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [user]);

  // Delete client function
  async function deleteClient(id: string) {
    if (!confirm("Are you sure you want to delete this client?")) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch("http://localhost:3000/deleteFileSendClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setClients(prevClients => prevClients.filter(client => client.id !== id));
        alert("Client deleted successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to delete client: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("An error occurred while deleting the client");
    } finally {
      setDeleting(null);
    }
  }

  // Add client function
  async function addClient(clientData: Omit<FileSendClient, 'id'>) {
    if (!user) return;

    try {
      const res = await fetch("http://localhost:3000/addFileSendClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ...clientData,
          userId: user.id 
        }),
      });

      if (res.ok) {
        const newClient = await res.json();
        setClients(prevClients => [...prevClients, newClient.client]);
        setShowAddForm(false);
        alert("Client added successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to add client: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding client:", error);
      alert("An error occurred while adding the client");
    }
  }

  // Update client function
  async function updateClient(clientData: FileSendClient) {
    try {
      const res = await fetch("http://localhost:3000/updateFileSendClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      if (res.ok) {
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === clientData.id ? clientData : client
          )
        );
        setEditingClient(null);
        alert("Client updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to update client: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      alert("An error occurred while updating the client");
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingClients = clients.filter(c => c.status === 'pending').length;

  // Client Form Component
  const ClientForm = ({ client, onSubmit, onCancel }: {
    client?: FileSendClient | null;
    onSubmit: (data: FileSendClient | Omit<FileSendClient, "id">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      client_name: client?.client_name || '',
      company_name: client?.company_name || '',
      client_email: client?.client_email || '',
      phone_number: client?.phone_number || '',
      status: client?.status || 'pending'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (client) {
        onSubmit({ ...client, ...formData });
      } else {
        onSubmit(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            {client ? 'Edit Client' : 'Add New Client'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as FileSendClient["status"] }))
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {client ? 'Update' : 'Add'} Client
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Client Details Modal
  const ClientDetailsModal = ({ client, onClose }: { client: FileSendClient; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">Client Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-400">Client ID</label>
            <p className="text-white">#{client.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Name</label>
            <p className="text-white">{client.client_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Company</label>
            <p className="text-white">{client.company_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Email</label>
            <p className="text-white">{client.client_email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Phone</label>
            <p className="text-white">{client.phone_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Status</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(client.status)}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${client.status === 'active' ? 'bg-emerald-400' : client.status === 'pending' ? 'bg-amber-400' : 'bg-slate-400'}`}></div>
              {client.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Send Files Modal
  const SendFilesModal = ({ client, onClose }: { client: FileSendClient; onClose: () => void }) => {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [fileSource, setFileSource] = useState<'local' | 'storage'>('local');
    const [sending, setSending] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(e.target.files);
      }
    };

    const handleSendFiles = async () => {
      if (!selectedFiles || selectedFiles.length === 0) {
        alert("Please select files to send");
        return;
      }

      setSending(true);
      try {
        const formData = new FormData();
        formData.append('clientId', client.id);
        formData.append('clientEmail', client.client_email);
        formData.append('clientName', client.client_name);
        
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }

        const res = await fetch("http://localhost:3000/sendFiles", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          alert("Files sent successfully!");
          onClose();
        } else {
          const errorData = await res.json();
          alert(`Failed to send files: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error sending files:", error);
        alert("An error occurred while sending files");
      } finally {
        setSending(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg mx-4">
          <h3 className="text-xl font-semibold text-white mb-4">Send Files to {client.client_name}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                File Source
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFileSource('local')}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    fileSource === 'local' 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm">Local Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFileSource('storage')}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    fileSource === 'storage' 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FolderOpen className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm">Storage</span>
                </button>
              </div>
            </div>

            {fileSource === 'local' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles && (
                  <div className="mt-2 text-sm text-slate-400">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </div>
            )}

            {fileSource === 'storage' && (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-slate-400 text-sm">
                  Storage file selection will be implemented in the next phase.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSendFiles}
                disabled={sending || !selectedFiles}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Files
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Send Files
            </h1>
          </div>
          <p className="text-slate-400">Manage clients and send them files via email</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-white">{totalClients}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Clients</p>
                <p className="text-2xl font-bold text-emerald-400">{activeClients}</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">{pendingClients}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Add Client Button */}
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No clients found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, index) => (
                    <tr
                      key={client.id || index}
                      className="hover:bg-slate-700/30 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {client.client_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{client.client_name || 'Unknown'}</p>
                            <p className="text-sm text-slate-400">Client ID: #{client.id || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">{client.company_name || 'No company'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                              {client.client_email || 'No email'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">
                              {client.phone_number || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${client.status === 'active' ? 'bg-emerald-400' : client.status === 'pending' ? 'bg-amber-400' : 'bg-slate-400'}`}></div>
                          {client.status || 'none'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Send Files Button */}
                          <button 
                            onClick={() => setShowSendFilesModal(client)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 hover:scale-110 group-hover:shadow-lg"
                            title="Send Files"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          
                          {/* View Details Button */}
                          <button 
                            onClick={() => setViewingClient(client)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 hover:scale-110 group-hover:shadow-lg"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => setEditingClient(client)}
                            className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 group-hover:shadow-lg"
                            title="Edit Client"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => deleteClient(client.id)}
                            disabled={deleting === client.id}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 hover:scale-110 group-hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Client"
                          >
                            {deleting === client.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredClients.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <p>Showing {filteredClients.length} of {totalClients} clients</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <ClientForm
          onSubmit={addClient}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingClient && (
        <ClientForm
          client={editingClient}
          onSubmit={updateClient}
          onCancel={() => setEditingClient(null)}
        />
      )}

      {viewingClient && (
        <ClientDetailsModal
          client={viewingClient}
          onClose={() => setViewingClient(null)}
        />
      )}

      {showSendFilesModal && (
        <SendFilesModal
          client={showSendFilesModal}
          onClose={() => setShowSendFilesModal(null)}
        />
      )}
    </div>
  );
}
