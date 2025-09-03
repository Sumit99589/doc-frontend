"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Search, X, Users, Filter, SortAsc, SortDesc, Mail, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RequestDocumentsDialog from './reqDoc';

export default function ClientsDialog({ clients, isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('client_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchTerm) {
      filtered = clients.filter(client => {
        const name = client.client_name?.toLowerCase() || '';
        const email = client.client_email?.toLowerCase() || '';
        const company = client.company?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term) || company.includes(term);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortField, sortDirection, statusFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const statusCounts = useMemo(() => {
    const counts = { all: clients.length, active: 0, pending: 0, inactive: 0 };
    clients.forEach(client => {
      if (client.status) {
        counts[client.status] = (counts[client.status] || 0) + 1;
      }
    });
    return counts;
  }, [clients]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 text-left align-middle shadow-2xl transition-all">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50 bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-white">
                        All Clients
                      </Dialog.Title>
                      <p className="text-sm text-slate-400 mt-1">
                        Manage and view all your clients ({clients.length} total)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters and Search */}
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search clients by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        autoFocus
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm min-w-[120px]"
                      >
                        <option value="all">All ({statusCounts.all})</option>
                        <option value="active">Active ({statusCounts.active || 0})</option>
                        <option value="pending">Pending ({statusCounts.pending || 0})</option>
                        <option value="inactive">Inactive ({statusCounts.inactive || 0})</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                      <thead className="bg-slate-800/60 sticky top-0 z-10">
                        <tr>
                          <th 
                            className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/30 transition-colors"
                            onClick={() => handleSort('client_name')}
                          >
                            <div className="flex items-center gap-2">
                              Client {getSortIcon('client_name')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/30 transition-colors"
                            onClick={() => handleSort('client_email')}
                          >
                            <div className="flex items-center gap-2">
                              Email {getSortIcon('client_email')}
                            </div>
                          </th>
                          {/* <th 
                            className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/30 transition-colors"
                            onClick={() => handleSort('company')}
                          >
                            <div className="flex items-center gap-2">
                              Company {getSortIcon('company')}
                            </div>
                          </th> */}
                          <th 
                            className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/30 transition-colors"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-2">
                              Status {getSortIcon('status')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
                        {filteredAndSortedClients.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                  <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-slate-300 font-medium">No clients found</p>
                                  <p className="text-slate-400 text-sm mt-1">
                                    {searchTerm ? 'Try adjusting your search terms' : 'No clients match the selected filters'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedClients.map((client, i) => (
                            <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                    {client.client_name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {client.client_name || 'Unknown Client'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-blue-400 text-sm">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{client.client_email}</span>
                                </div>
                              </td>
                              {/* <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                  <Building className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                  <span className="truncate">{client.company || 'No company'}</span>
                                </div>
                              </td> */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                  client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  client.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                  client.status === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                )}>
                                  {client.status || 'none'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <RequestDocumentsDialog clientName={client.client_name} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing {filteredAndSortedClients.length} of {clients.length} clients
                  </div>
                  <Button 
                    onClick={onClose} 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6"
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
