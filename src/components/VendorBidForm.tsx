import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { Task, BidDetail } from '../types';
import { ArrowLeft, Send } from 'lucide-react';

export function VendorBidForm({ taskId, onBack }: { taskId: string; onBack: () => void }) {
  const { state, dispatch } = useVms();
  const task = state.tasks.find(t => t.id === taskId);
  
  const [bids, setBids] = useState<Record<string, { unitPrice: string; leadTime: string }>>({});

  if (!task) return null;

  const { currentUser } = state;
  const vendorId = currentUser?.type === 'Vendor' ? currentUser.vendorId : null;

  const existingQuote = state.quotations.find(q => q.taskId === taskId && q.vendorId === vendorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    const bidDetails: BidDetail[] = task.lineItems.map(li => ({
      lineItemId: li.id,
      unitPrice: parseFloat(bids[li.id]?.unitPrice || '0'),
      leadTime: parseInt(bids[li.id]?.leadTime || '0', 10),
    }));

    const totalCost = bidDetails.reduce((sum, b) => {
      const qty = task.lineItems.find(li => li.id === b.lineItemId)?.quantity || 0;
      return sum + (b.unitPrice * qty);
    }, 0);

    dispatch({
      type: 'SUBMIT_BID',
      payload: {
        id: `q-${Date.now()}`,
        taskId,
        vendorId,
        bidDetails,
        totalCost
      }
    });
    onBack();
  };

  return (
    <div className="space-y-8 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>

      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Submit Bid: {task.title}</h1>
        <p className="text-gray-400 text-sm mb-6">Please provide your unit price and lead time for each line item.</p>

        {existingQuote ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-emerald-400 mb-2">Bid Submitted Successfully</h3>
            <p className="text-gray-400 text-sm">You have already submitted a bid for this task.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Line Item Description</th>
                    <th className="px-6 py-4 font-medium text-right">Quantity</th>
                    <th className="px-6 py-4 font-medium">Unit Price ($)</th>
                    <th className="px-6 py-4 font-medium">Lead Time (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {task.lineItems.map(li => (
                    <tr key={li.id}>
                      <td className="px-6 py-4 font-medium text-gray-200">{li.description}</td>
                      <td className="px-6 py-4 text-right text-gray-400">{li.quantity}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={bids[li.id]?.unitPrice || ''}
                          onChange={e => setBids(prev => ({ ...prev, [li.id]: { ...prev[li.id], unitPrice: e.target.value } }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          value={bids[li.id]?.leadTime || ''}
                          onChange={e => setBids(prev => ({ ...prev, [li.id]: { ...prev[li.id], leadTime: e.target.value } }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Days"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit Quotation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
