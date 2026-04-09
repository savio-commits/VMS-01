import React from 'react';
import { useVms } from '../context/VmsContext';
import { Building2, Star, Mail, Phone, ChevronRight } from 'lucide-react';

export function VendorDirectory({ onSelectVendor }: { onSelectVendor: (id: string) => void }) {
  const { state } = useVms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Vendor Directory</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.vendors.map(vendor => (
          <div 
            key={vendor.id} 
            onClick={() => onSelectVendor(vendor.id)}
            className="glass-card p-5 cursor-pointer group hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{vendor.companyName}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{vendor.rating}</span>
                    <span className="text-gray-500 ml-1">({vendor.completedTasks} tasks)</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" /> {vendor.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" /> {vendor.phone}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {vendor.categoryTags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
