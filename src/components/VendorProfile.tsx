import React from 'react';
import { useVms } from '../context/VmsContext';
import { ArrowLeft, Building2, Star, Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function VendorProfile({ vendorId, onBack, onSelectTask }: { vendorId: string; onBack: () => void; onSelectTask: (id: string) => void }) {
  const { state } = useVms();
  const vendor = state.vendors.find(v => v.id === vendorId);

  if (!vendor) return null;

  const vendorQuotations = state.quotations.filter(q => q.vendorId === vendorId);
  const biddedTasks = state.tasks.filter(t => vendorQuotations.some(q => q.taskId === t.id));

  return (
    <div className="space-y-8 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="glass-card p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {vendor.companyName}
                {vendor.verificationStatus === 'Pre-vetted' && (
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                )}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {vendor.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {vendor.phone}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-amber-400 text-2xl font-bold">
              <Star className="w-6 h-6 fill-current" /> {vendor.rating}
            </div>
            <p className="text-gray-400 text-sm mt-1">{vendor.completedTasks} Completed Tasks</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {vendor.categoryTags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Bidding History & Active Tasks</h2>
        <div className="grid gap-4">
          {biddedTasks.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-400">
              No bidding history found for this vendor.
            </div>
          ) : (
            biddedTasks.map(task => {
              const quote = vendorQuotations.find(q => q.taskId === task.id);
              const isWinner = task.selectedVendorId === vendor.id || (task.status === 'Finalized/PO' && quote && task.selectedVendorId === vendor.id); // Simplification
              
              return (
                <div 
                  key={task.id} 
                  onClick={() => onSelectTask(task.id)}
                  className="glass-card p-5 cursor-pointer group hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                        <span>Bid Amount: <strong className="text-gray-200">${quote?.totalCost.toLocaleString()}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        isWinner ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        task.status === 'Finalized/PO' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        {isWinner ? 'Awarded' : task.status === 'Finalized/PO' ? 'Lost' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
