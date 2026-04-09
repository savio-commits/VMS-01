import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { Task } from '../types';
import { format } from 'date-fns';
import { ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CreateTaskModal } from './CreateTaskModal';

export function TaskList({ onSelectTask }: { onSelectTask: (taskId: string) => void }) {
  const { state } = useVms();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { currentUser } = state;
  const isVendor = currentUser?.type === 'Vendor';
  
  let visibleTasks = state.tasks;
  if (isVendor && currentUser.type === 'Vendor') {
    const currentVendor = state.vendors.find(v => v.id === currentUser.vendorId);
    const vendorQuotations = state.quotations.filter(q => q.vendorId === currentUser.vendorId);
    const biddedTaskIds = new Set(vendorQuotations.map(q => q.taskId));
    
    // Vendors only see tasks in Bidding or tasks they have bid on
    // AND the task must either have no required category, or match one of the vendor's categories
    visibleTasks = state.tasks.filter(t => {
      const hasBid = biddedTaskIds.has(t.id);
      const isStatusValid = t.status === 'Bidding' || hasBid;
      const isCategoryValid = !t.requiredVendorCategory || currentVendor?.categoryTags.includes(t.requiredVendorCategory);
      return isStatusValid && isCategoryValid;
    });
  } else {
    // Departments see their tasks, or all tasks if we want a global view. 
    // Let's say they see all tasks but we can highlight theirs.
    // For simplicity, show all tasks.
  }

  const getStatusDisplay = (task: Task) => {
    if (!isVendor) {
      return {
        label: task.status,
        color: task.status === 'Bidding' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
               task.status === 'Comparison' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
               task.status === 'Finalized/PO' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
               'text-amber-400 bg-amber-400/10 border-amber-400/20'
      };
    }

    const hasBid = currentUser?.type === 'Vendor' && state.quotations.some(q => q.taskId === task.id && q.vendorId === currentUser.vendorId);
    
    if (task.status === 'Bidding') {
      return {
        label: hasBid ? 'Bid Submitted' : 'Open for Bids',
        color: hasBid ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      };
    }
    
    if (task.status === 'Finalized/PO') {
      const isWinner = currentUser?.type === 'Vendor' && task.selectedVendorId === currentUser.vendorId;
      return {
        label: isWinner ? 'Awarded' : 'Closed',
        color: isWinner ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
      };
    }

    return {
      label: 'Under Review',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Active Tasks</h2>
        {!isVendor && currentUser?.role === 'Executive' && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            Create New Task
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {visibleTasks.map(task => {
          const dept = state.departments.find(d => d.id === task.deptId);
          const hasBid = isVendor && currentUser?.type === 'Vendor' && state.quotations.some(q => q.taskId === task.id && q.vendorId === currentUser.vendorId);
          const creator = state.users.find(u => u.id === task.creatorId);

          return (
            <div 
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className="glass-card p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {task.title}
                    </h3>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusDisplay(task).color)}>
                      {getStatusDisplay(task).label}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      task.priority === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      task.priority === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {task.priority} Priority
                    </span>
                    {!isVendor && hasBid && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Bid Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Requested by {creator?.name} • {dept?.name} Dept
                  </p>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4" />
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
        {visibleTasks.length === 0 && (
          <div className="text-center py-12 glass-card">
            <p className="text-gray-400">No tasks found.</p>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
