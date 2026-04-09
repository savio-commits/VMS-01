export type Department = {
  id: string;
  name: string;
};

export type Vendor = {
  id: string;
  companyName: string;
  categoryTags: string[];
  verificationStatus: 'Pre-vetted' | 'Pending' | 'Rejected';
  email: string;
  phone: string;
  rating: number;
  completedTasks: number;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
};

export type TaskStatus =
  | 'Bidding'
  | 'Comparison'
  | 'Marketing Approval'
  | 'Sales Approval'
  | 'Product Approval'
  | 'Finalized/PO';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type UserRole = 'Executive' | 'Approver';

export type InternalUser = {
  type: 'Internal';
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
};

export type VendorUser = {
  type: 'Vendor';
  id: string;
  name: string;
  email: string;
  vendorId: string;
};

export type User = InternalUser | VendorUser;

export type Task = {
  id: string;
  deptId: string;
  status: TaskStatus;
  priority: TaskPriority;
  lineItems: LineItem[];
  creatorId: string;
  marketingApproverId?: string;
  salesApproverId?: string;
  productApproverId?: string;
  title: string;
  selectedVendorId?: string;
  requiredVendorCategory?: string;
  createdAt: string;
};

export type BidDetail = {
  lineItemId: string;
  unitPrice: number;
  leadTime: number; // in days
};

export type Quotation = {
  id: string;
  taskId: string;
  vendorId: string;
  bidDetails: BidDetail[];
  totalCost: number;
};

export type AuditLog = {
  id: string;
  taskId: string;
  action: string;
  user: string;
  timestamp: string;
  comments?: string;
};

export type VmsState = {
  departments: Department[];
  users: User[];
  vendors: Vendor[];
  tasks: Task[];
  quotations: Quotation[];
  auditLogs: AuditLog[];
  currentUser: User | null;
  currentTab: 'tasks' | 'directory';
};
