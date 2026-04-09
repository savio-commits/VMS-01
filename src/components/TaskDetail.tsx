import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { Task, TaskStatus } from '../types';
import { ArrowLeft, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const STATUS_ORDER: TaskStatus[] = [
  'Bidding',
  'Comparison',
  'Marketing Approval',
  'Sales Approval',
  'Product Approval',
  'Finalized/PO'
];

export function TaskDetail({ taskId, onBack }: { taskId: string; onBack: () => void }) {
  const { state, dispatch } = useVms();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [showApproveInput, setShowApproveInput] = useState(false);
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState('');

  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return null;

  const { currentUser } = state;
  const isVendor = currentUser?.type === 'Vendor';
  const currentStatusIndex = STATUS_ORDER.indexOf(task.status);

  const handleApprove = () => {
    if (currentStatusIndex < STATUS_ORDER.length - 1) {
      const nextStatus = STATUS_ORDER[currentStatusIndex + 1];
      
      let approverRole: 'marketingApproverId' | 'salesApproverId' | 'productApproverId' | undefined;
      if (task.status === 'Marketing Approval') approverRole = 'marketingApproverId';
      if (task.status === 'Sales Approval') approverRole = 'salesApproverId';
      if (task.status === 'Product Approval') approverRole = 'productApproverId';

      dispatch({
        type: 'UPDATE_TASK_STATUS',
        payload: {
          taskId: task.id,
          status: nextStatus,
          user: currentUser?.name || 'Unknown',
          comments: approveComment.trim() || undefined,
          selectedVendorId: task.status === 'Comparison' ? selectedVendorForApproval : undefined,
          approverId: currentUser?.id,
          approverRole
        }
      });
      setShowApproveInput(false);
      setApproveComment('');
      setSelectedVendorForApproval('');
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    dispatch({
      type: 'REJECT_TASK',
      payload: {
        taskId: task.id,
        user: currentUser?.name || 'Unknown',
        comments: rejectReason
      }
    });
    setShowRejectInput(false);
    setRejectReason('');
  };

  const canApprove = () => {
    if (isVendor || !currentUser || currentUser.type !== 'Internal') return false;
    if (currentUser.role !== 'Approver' && currentUser.role !== 'Executive') return false;
    
    if (task.status === 'Comparison') return true; // Anyone can move from Comparison to Marketing Approval
    if (task.status === 'Marketing Approval' && currentUser.department === 'Marketing' && currentUser.role === 'Approver') return true;
    if (task.status === 'Sales Approval' && currentUser.department === 'Sales' && currentUser.role === 'Approver') return true;
    if (task.status === 'Product Approval' && currentUser.department === 'Product' && currentUser.role === 'Approver') return true;
    return false;
  };

  const canReject = () => {
    if (isVendor || !currentUser || currentUser.type !== 'Internal') return false;
    if (currentUser.role !== 'Approver') return false;

    if (task.status === 'Marketing Approval' && currentUser.department === 'Marketing') return true;
    if (task.status === 'Sales Approval' && currentUser.department === 'Sales') return true;
    if (task.status === 'Product Approval' && currentUser.department === 'Product') return true;
    return false;
  };

  const taskQuotations = state.quotations.filter(q => q.taskId === task.id);
  const vendorsWithBids = state.vendors.filter(v => taskQuotations.some(q => q.vendorId === v.id));

  // Find lowest price and lead time per line item
  const bestMetrics: Record<string, { minPrice: number; minLeadTime: number }> = {};
  task.lineItems.forEach(li => {
    const bidsForLi = taskQuotations.flatMap(q => q.bidDetails.filter(b => b.lineItemId === li.id));
    if (bidsForLi.length > 0) {
      bestMetrics[li.id] = {
        minPrice: Math.min(...bidsForLi.map(b => b.unitPrice)),
        minLeadTime: Math.min(...bidsForLi.map(b => b.leadTime)),
      };
    }
  });

  const getStatusDisplay = () => {
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
    <div className="space-y-8 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>

      <div className="glass-card p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{task.title}</h1>
            <p className="text-gray-400 mt-1">Requested by {state.users.find(u => u.id === task.creatorId)?.name}</p>
          </div>
          <div className="text-right">
            <span className={cn("inline-block px-3 py-1 rounded-full text-sm font-medium border", getStatusDisplay().color)}>
              {getStatusDisplay().label}
            </span>
          </div>
        </div>

        {/* Stepper */}
        {!isVendor && (
          <div className="py-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-800 -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-cyan-500 -z-10 transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
              />
              
              {STATUS_ORDER.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={status} className="flex flex-col items-center gap-2 bg-[#0a0a0a] px-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted ? "bg-cyan-500 border-cyan-500 text-black" :
                      isCurrent ? "bg-black border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" :
                      "bg-black border-gray-700 text-gray-600"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                    </div>
                    <span className={cn(
                      "text-xs font-medium max-w-[80px] text-center",
                      isCompleted || isCurrent ? "text-gray-200" : "text-gray-600"
                    )}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Matrix */}
      {!isVendor && taskQuotations.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Vendor Comparison Matrix</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Line Item</th>
                  <th className="px-6 py-4 font-medium text-right">Qty</th>
                  {vendorsWithBids.map(v => (
                    <th key={v.id} className="px-6 py-4 font-medium text-center border-l border-white/10">
                      {v.companyName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {task.lineItems.map(li => (
                  <tr key={li.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-200">{li.description}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{li.quantity}</td>
                    {vendorsWithBids.map(v => {
                      const quote = taskQuotations.find(q => q.vendorId === v.id);
                      const bid = quote?.bidDetails.find(b => b.lineItemId === li.id);
                      
                      if (!bid) return <td key={v.id} className="px-6 py-4 text-center text-gray-600 border-l border-white/10">-</td>;
                      
                      const isBestPrice = bid.unitPrice === bestMetrics[li.id]?.minPrice;
                      const isBestTime = bid.leadTime === bestMetrics[li.id]?.minLeadTime;

                      return (
                        <td key={v.id} className="px-6 py-4 border-l border-white/10">
                          <div className="flex flex-col gap-1 items-center">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              isBestPrice ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-gray-300"
                            )}>
                              ${bid.unitPrice.toLocaleString()}
                            </span>
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              isBestTime ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400"
                            )}>
                              {bid.leadTime} days
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-black/40 border-t border-white/10">
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-semibold text-right text-gray-200">Subtotal</td>
                  {vendorsWithBids.map(v => {
                    const quote = taskQuotations.find(q => q.vendorId === v.id);
                    const subtotal = quote?.bidDetails.reduce((sum, b) => {
                      const qty = task.lineItems.find(li => li.id === b.lineItemId)?.quantity || 0;
                      return sum + (b.unitPrice * qty);
                    }, 0) || 0;
                    return <td key={v.id} className="px-6 py-4 text-center font-medium text-gray-300 border-l border-white/10">${subtotal.toLocaleString()}</td>;
                  })}
                </tr>
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-semibold text-right text-gray-200">Taxes (10%)</td>
                  {vendorsWithBids.map(v => {
                    const quote = taskQuotations.find(q => q.vendorId === v.id);
                    const subtotal = quote?.bidDetails.reduce((sum, b) => {
                      const qty = task.lineItems.find(li => li.id === b.lineItemId)?.quantity || 0;
                      return sum + (b.unitPrice * qty);
                    }, 0) || 0;
                    return <td key={v.id} className="px-6 py-4 text-center text-gray-400 border-l border-white/10">${(subtotal * 0.1).toLocaleString()}</td>;
                  })}
                </tr>
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-bold text-right text-white text-lg">Grand Total</td>
                  {vendorsWithBids.map(v => {
                    const quote = taskQuotations.find(q => q.vendorId === v.id);
                    const subtotal = quote?.bidDetails.reduce((sum, b) => {
                      const qty = task.lineItems.find(li => li.id === b.lineItemId)?.quantity || 0;
                      return sum + (b.unitPrice * qty);
                    }, 0) || 0;
                    const total = subtotal * 1.1;
                    return <td key={v.id} className="px-6 py-4 text-center font-bold text-cyan-400 text-lg border-l border-white/10">${total.toLocaleString()}</td>;
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-white">Task Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Department</p>
            <p className="text-white font-medium">{state.departments.find(d => d.id === task.deptId)?.name} ({task.deptId})</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Created At</p>
            <p className="text-white font-medium">{format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Created By</p>
            <p className="text-white font-medium">{state.users.find(u => u.id === task.creatorId)?.name}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Priority</p>
            {!isVendor && task.status !== 'Finalized/PO' ? (
              <select
                value={task.priority}
                onChange={(e) => dispatch({
                  type: 'UPDATE_TASK_PRIORITY',
                  payload: { taskId: task.id, priority: e.target.value as any, user: currentUser?.name || 'Unknown' }
                })}
                className={cn(
                  "bg-black/50 border rounded-lg px-2 py-1 text-sm focus:outline-none transition-colors appearance-none cursor-pointer",
                  task.priority === 'High' ? "text-red-400 border-red-500/50 focus:border-red-500" :
                  task.priority === 'Medium' ? "text-amber-400 border-amber-500/50 focus:border-amber-500" :
                  "text-blue-400 border-blue-500/50 focus:border-blue-500"
                )}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            ) : (
              <p className="text-white font-medium">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium border",
                  task.priority === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  task.priority === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>
                  {task.priority}
                </span>
              </p>
            )}
          </div>
          <div>
            <p className="text-gray-400 mb-1">Total Line Items</p>
            <p className="text-white font-medium">{task.lineItems.length}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Required Category</p>
            <p className="text-white font-medium">
              {task.requiredVendorCategory ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {task.requiredVendorCategory}
                </span>
              ) : (
                <span className="text-gray-500">All Categories</span>
              )}
            </p>
          </div>
          {task.selectedVendorId && (
            <div>
              <p className="text-gray-400 mb-1">Selected Vendor</p>
              <p className="text-cyan-400 font-medium">
                {state.vendors.find(v => v.id === task.selectedVendorId)?.companyName}
              </p>
            </div>
          )}
        </div>
        
        {(task.marketingApproverId || task.salesApproverId || task.productApproverId) && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {task.marketingApproverId && (
              <div>
                <p className="text-gray-400 mb-1">Marketing Approver</p>
                <p className="text-white font-medium">{state.users.find(u => u.id === task.marketingApproverId)?.name}</p>
              </div>
            )}
            {task.salesApproverId && (
              <div>
                <p className="text-gray-400 mb-1">Sales Approver</p>
                <p className="text-white font-medium">{state.users.find(u => u.id === task.salesApproverId)?.name}</p>
              </div>
            )}
            {task.productApproverId && (
              <div>
                <p className="text-gray-400 mb-1">Product Approver</p>
                <p className="text-white font-medium">{state.users.find(u => u.id === task.productApproverId)?.name}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isVendor && task.status !== 'Bidding' && task.status !== 'Finalized/PO' && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Approval Actions</h3>
          
          {showApproveInput ? (
            <div className="space-y-4">
              {task.status === 'Comparison' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Select Winning Vendor</label>
                  <select
                    value={selectedVendorForApproval}
                    onChange={e => setSelectedVendorForApproval(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                  >
                    <option value="">-- Select a Vendor --</option>
                    {vendorsWithBids.map(v => (
                      <option key={v.id} value={v.id}>{v.companyName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Approval Comments (Optional)</label>
                <textarea 
                  value={approveComment}
                  onChange={e => setApproveComment(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  rows={3}
                  placeholder="Add any comments or conditions for this approval..."
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleApprove}
                  disabled={task.status === 'Comparison' && !selectedVendorForApproval}
                  className="btn-primary"
                >
                  Confirm Approval
                </button>
                <button 
                  onClick={() => {
                    setShowApproveInput(false);
                    setApproveComment('');
                    setSelectedVendorForApproval('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : showRejectInput ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rejection Reason (Mandatory)</label>
                <textarea 
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  rows={3}
                  placeholder="Explain why this is being rejected..."
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="btn-danger"
                >
                  Confirm Rejection
                </button>
                <button 
                  onClick={() => setShowRejectInput(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {task.status === 'Comparison' && (
                <button 
                  onClick={() => setShowApproveInput(true)} 
                  className="btn-primary w-full"
                >
                  Submit for Marketing Approval
                </button>
              )}
              
              {task.status !== 'Comparison' && (
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setShowApproveInput(true)}
                    disabled={task.status !== 'Marketing Approval' || currentUser?.department !== 'Marketing' || currentUser?.role !== 'Approver'}
                    className="btn-primary"
                  >
                    Marketing Approval
                  </button>
                  <button 
                    onClick={() => setShowApproveInput(true)}
                    disabled={task.status !== 'Sales Approval' || currentUser?.department !== 'Sales' || currentUser?.role !== 'Approver'}
                    className="btn-primary"
                  >
                    Sales Approval
                  </button>
                  <button 
                    onClick={() => setShowApproveInput(true)}
                    disabled={task.status !== 'Product Approval' || currentUser?.department !== 'Product' || currentUser?.role !== 'Approver'}
                    className="btn-primary"
                  >
                    Product Approval (Issue PO)
                  </button>
                </div>
              )}

              {canReject() && (
                <div className="mt-2 pt-4 border-t border-white/10">
                  <button onClick={() => setShowRejectInput(true)} className="btn-danger w-full">
                    Reject & Return to Comparison
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail */}
      {!isVendor && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Audit Trail</h3>
          <div className="space-y-6">
            {state.auditLogs.filter(l => l.taskId === task.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, i) => (
              <div key={log.id} className="flex gap-4 relative">
                {i !== state.auditLogs.filter(l => l.taskId === task.id).length - 1 && (
                  <div className="absolute left-2 top-8 bottom-[-24px] w-px bg-white/10" />
                )}
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/50 mt-1 shrink-0 z-10" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {log.user} • {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                  </p>
                  {log.comments && (
                    <div className="mt-2 text-sm text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                      "{log.comments}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
