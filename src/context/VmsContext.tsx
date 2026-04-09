import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { VmsState, Task, Quotation, AuditLog, LineItem, TaskStatus, TaskPriority, User } from '../types';

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TAB'; payload: 'tasks' | 'directory' }
  | { type: 'CREATE_TASK'; payload: Task }
  | { type: 'SUBMIT_BID'; payload: Quotation }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus; user: string; comments?: string; selectedVendorId?: string; approverId?: string; approverRole?: 'marketingApproverId' | 'salesApproverId' | 'productApproverId' } }
  | { type: 'UPDATE_TASK_PRIORITY'; payload: { taskId: string; priority: TaskPriority; user: string } }
  | { type: 'REJECT_TASK'; payload: { taskId: string; user: string; comments: string } };

const initialState: VmsState = {
  departments: [
    { id: 'dept-1', name: 'Marketing' },
    { id: 'dept-2', name: 'Sales' },
    { id: 'dept-3', name: 'Product' },
  ],
  users: [
    { type: 'Internal', id: 'u-1', name: 'Alice (Exec)', email: 'alice@company.com', department: 'Marketing', role: 'Executive' },
    { type: 'Internal', id: 'u-2', name: 'Bob (Appr)', email: 'bob@company.com', department: 'Marketing', role: 'Approver' },
    { type: 'Internal', id: 'u-3', name: 'Charlie (Exec)', email: 'charlie@company.com', department: 'Sales', role: 'Executive' },
    { type: 'Internal', id: 'u-4', name: 'Diana (Appr)', email: 'diana@company.com', department: 'Sales', role: 'Approver' },
    { type: 'Internal', id: 'u-5', name: 'Eve (Exec)', email: 'eve@company.com', department: 'Product', role: 'Executive' },
    { type: 'Internal', id: 'u-6', name: 'Frank (Appr)', email: 'frank@company.com', department: 'Product', role: 'Approver' },
    { type: 'Vendor', id: 'u-v1', name: 'Acme Contact', email: 'contact@acmecorp.com', vendorId: 'v-1' },
    { type: 'Vendor', id: 'u-v2', name: 'Global Tech Contact', email: 'contact@globaltech.io', vendorId: 'v-2' },
  ],
  vendors: [
    { id: 'v-1', companyName: 'Acme Corp', categoryTags: ['Hardware', 'IT'], verificationStatus: 'Pre-vetted', email: 'sales@acmecorp.com', phone: '+1-555-0101', rating: 4.8, completedTasks: 24 },
    { id: 'v-2', companyName: 'Global Tech', categoryTags: ['Software', 'Cloud'], verificationStatus: 'Pre-vetted', email: 'hello@globaltech.io', phone: '+1-555-0102', rating: 4.5, completedTasks: 18 },
    { id: 'v-3', companyName: 'Nexus Solutions', categoryTags: ['Consulting', 'IT'], verificationStatus: 'Pre-vetted', email: 'contact@nexus.com', phone: '+1-555-0103', rating: 4.9, completedTasks: 42 },
    { id: 'v-4', companyName: 'Stellar Events Co.', categoryTags: ['Event Handling'], verificationStatus: 'Pre-vetted', email: 'events@stellar.co', phone: '+1-555-0104', rating: 4.7, completedTasks: 15 },
    { id: 'v-5', companyName: 'Grand Gala Planners', categoryTags: ['Event Handling'], verificationStatus: 'Pre-vetted', email: 'info@grandgala.com', phone: '+1-555-0105', rating: 4.6, completedTasks: 31 },
    { id: 'v-6', companyName: 'Cinematic Visions', categoryTags: ['Videography'], verificationStatus: 'Pre-vetted', email: 'hello@cinematicvisions.com', phone: '+1-555-0106', rating: 4.9, completedTasks: 56 },
    { id: 'v-7', companyName: 'Motion Frame Studios', categoryTags: ['Videography'], verificationStatus: 'Pre-vetted', email: 'bookings@motionframe.com', phone: '+1-555-0107', rating: 4.4, completedTasks: 9 },
    { id: 'v-8', companyName: 'Lens & Light', categoryTags: ['Photography'], verificationStatus: 'Pre-vetted', email: 'shoot@lenslight.com', phone: '+1-555-0108', rating: 4.8, completedTasks: 22 },
    { id: 'v-9', companyName: 'Candid Moments', categoryTags: ['Photography'], verificationStatus: 'Pre-vetted', email: 'smile@candidmoments.com', phone: '+1-555-0109', rating: 4.7, completedTasks: 14 },
    { id: 'v-10', companyName: 'Prime Printworks', categoryTags: ['Prints'], verificationStatus: 'Pre-vetted', email: 'print@primeprintworks.com', phone: '+1-555-0110', rating: 4.5, completedTasks: 88 },
    { id: 'v-11', companyName: 'Colorfast Press', categoryTags: ['Prints'], verificationStatus: 'Pre-vetted', email: 'orders@colorfast.com', phone: '+1-555-0111', rating: 4.3, completedTasks: 45 },
    { id: 'v-12', companyName: 'Bespoke Hampers', categoryTags: ['Gifting'], verificationStatus: 'Pre-vetted', email: 'gifts@bespokehampers.com', phone: '+1-555-0112', rating: 4.9, completedTasks: 112 },
    { id: 'v-13', companyName: 'Corporate Gifting Co.', categoryTags: ['Gifting'], verificationStatus: 'Pre-vetted', email: 'sales@corporategifting.com', phone: '+1-555-0113', rating: 4.6, completedTasks: 67 },
  ],
  tasks: [
    {
      id: 't-1',
      title: 'Q3 Server Upgrade',
      deptId: 'dept-3',
      status: 'Bidding',
      priority: 'High',
      creatorId: 'u-5',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-1', description: 'Enterprise Servers', quantity: 5 },
        { id: 'li-2', description: 'Network Switches', quantity: 10 },
      ],
    },
    {
      id: 't-2',
      title: 'Annual Marketing Summit Logistics',
      deptId: 'dept-1',
      status: 'Comparison',
      priority: 'Medium',
      creatorId: 'u-1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lineItems: [
        { id: 'li-3', description: 'Event Venue Rental (Days)', quantity: 3 },
        { id: 'li-4', description: 'Catering Packages', quantity: 150 },
      ],
    },
  ],
  quotations: [
    {
      id: 'q-1',
      taskId: 't-2',
      vendorId: 'v-1',
      totalCost: 16500,
      bidDetails: [
        { lineItemId: 'li-3', unitPrice: 5000, leadTime: 30 },
        { lineItemId: 'li-4', unitPrice: 10, leadTime: 14 },
      ],
    },
    {
      id: 'q-2',
      taskId: 't-2',
      vendorId: 'v-2',
      totalCost: 14250,
      bidDetails: [
        { lineItemId: 'li-3', unitPrice: 4000, leadTime: 45 },
        { lineItemId: 'li-4', unitPrice: 15, leadTime: 10 },
      ],
    },
  ],
  auditLogs: [
    {
      id: 'al-1',
      taskId: 't-1',
      action: 'Task Created',
      user: 'Alice Johnson',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'al-2',
      taskId: 't-2',
      action: 'Task Created',
      user: 'Bob Smith',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'al-3',
      taskId: 't-2',
      action: 'Bidding Closed',
      user: 'System',
      timestamp: new Date(Date.now() - 40000000).toISOString(),
    }
  ],
  currentUser: null,
  currentTab: 'tasks',
};

function vmsReducer(state: VmsState, action: Action): VmsState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, currentTab: 'tasks' };
    case 'SET_TAB':
      return { ...state, currentTab: action.payload };
    case 'CREATE_TASK': {
      const creator = state.users.find(u => u.id === action.payload.creatorId);
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        auditLogs: [
          ...state.auditLogs,
          {
            id: `al-${Date.now()}`,
            taskId: action.payload.id,
            action: 'Task Created',
            user: creator?.name || 'Unknown',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    case 'SUBMIT_BID':
      return {
        ...state,
        quotations: [...state.quotations, action.payload],
        auditLogs: [
          ...state.auditLogs,
          {
            id: `al-${Date.now()}`,
            taskId: action.payload.taskId,
            action: `Bid Submitted by ${state.vendors.find(v => v.id === action.payload.vendorId)?.companyName}`,
            user: 'Vendor',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    case 'UPDATE_TASK_STATUS': {
      const { taskId, status, user, comments, selectedVendorId, approverId, approverRole } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          const updatedTask = { ...t, status, selectedVendorId: selectedVendorId || t.selectedVendorId };
          if (approverId && approverRole) {
            updatedTask[approverRole] = approverId;
          }
          return updatedTask;
        }),
        auditLogs: [
          ...state.auditLogs,
          {
            id: `al-${Date.now()}`,
            taskId,
            action: `Status Updated: ${status}`,
            user,
            timestamp: new Date().toISOString(),
            comments,
          },
        ],
      };
    }
    case 'UPDATE_TASK_PRIORITY': {
      const { taskId, priority, user } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === taskId ? { ...t, priority } : t)),
        auditLogs: [
          ...state.auditLogs,
          {
            id: `al-${Date.now()}`,
            taskId,
            action: `Priority Updated: ${priority}`,
            user,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    case 'REJECT_TASK': {
      const { taskId, user, comments } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === taskId ? { ...t, status: 'Comparison' } : t)),
        auditLogs: [
          ...state.auditLogs,
          {
            id: `al-${Date.now()}`,
            taskId,
            action: 'Task Rejected - Reset to Comparison',
            user,
            timestamp: new Date().toISOString(),
            comments,
          },
        ],
      };
    }
    default:
      return state;
  }
}

const VmsContext = createContext<{ state: VmsState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function VmsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vmsReducer, initialState);
  return <VmsContext.Provider value={{ state, dispatch }}>{children}</VmsContext.Provider>;
}

export function useVms() {
  const context = useContext(VmsContext);
  if (!context) throw new Error('useVms must be used within a VmsProvider');
  return context;
}
