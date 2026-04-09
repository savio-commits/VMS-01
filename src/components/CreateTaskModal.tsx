import React, { useState, useMemo } from 'react';
import { useVms } from '../context/VmsContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { LineItem, TaskPriority } from '../types';

export function CreateTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, dispatch } = useVms();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [lineItems, setLineItems] = useState<Omit<LineItem, 'id'>[]>([{ description: '', quantity: 1 }]);

  // Extract unique categories from all vendors
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    state.vendors.forEach(v => {
      v.categoryTags.forEach(tag => categories.add(tag));
    });
    return Array.from(categories).sort();
  }, [state.vendors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.currentUser || state.currentUser.type !== 'Internal') return;

    const dept = state.departments.find(d => d.name === state.currentUser?.department);
    if (!dept) return;

    // Filter out empty line items
    const validLineItems = lineItems.filter(li => li.description.trim() !== '' && li.quantity > 0);
    
    if (validLineItems.length === 0) {
      alert('Please add at least one valid line item.');
      return;
    }

    const newTask = {
      id: `t-${Date.now()}`,
      title,
      deptId: dept.id,
      status: 'Bidding' as const,
      priority,
      creatorId: state.currentUser.id,
      requiredVendorCategory: selectedCategory || undefined,
      createdAt: new Date().toISOString(),
      lineItems: validLineItems.map((li, index) => ({
        id: `li-${Date.now()}-${index}`,
        description: li.description,
        quantity: li.quantity
      }))
    };

    dispatch({ type: 'CREATE_TASK', payload: newTask });
    
    // Reset and close
    setTitle('');
    setSelectedCategory('');
    setPriority('Medium');
    setLineItems([{ description: '', quantity: 1 }]);
    onClose();
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g., Q4 Marketing Campaign"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Required Vendor Category (Optional)</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="">All Categories (Any Vendor)</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Line Items</h3>
                <button 
                  type="button"
                  onClick={addLineItem}
                  className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={e => updateLineItem(index, 'description', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                        placeholder="Qty"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="mt-1 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0 bg-black/20 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-task-form"
            className="btn-primary"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
