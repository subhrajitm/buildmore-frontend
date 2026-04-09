// @ts-ignore
const BASE_URL: string = import.meta.env?.VITE_API_URL || 'http://localhost:5050';

type RequestOptions = {
  method?: string;
  body?: object;
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.err || 'Request failed');
  }
  return data as T;
}

async function requestFormData<T>(path: string, formData: FormData, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.err || 'Request failed');
  }
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const authApi = {
  signup: (body: { name: string; email: string; password: string; phone: string }) =>
    request<AuthResponse>('/api/user/signup', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/user/login', { method: 'POST', body }),

  forgotPassword: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/user/forgetpassword', { method: 'POST', body }),
};

// ── Product types ─────────────────────────────────────────────────────────────

export interface BackendProduct {
  _id: string;
  productName: string;
  desc?: string;
  category: string;
  price: number;
  productImages: string[];
  materialSpecifications?: string;
  stock: number;
  availability: boolean;
}

export interface ProductsResponse {
  success: boolean;
  products: BackendProduct[];
}

export interface ProductResponse {
  success: boolean;
  product: BackendProduct;
}

export interface CategoriesResponse {
  success: boolean;
  categories: string[];
}

// ── Public Product API ────────────────────────────────────────────────────────

export const productApi = {
  getAll: (params?: { search?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<ProductsResponse>(`/api/products${query}`);
  },

  getById: (id: string) =>
    request<ProductResponse>(`/api/products/${id}`),

  getCategories: () =>
    request<CategoriesResponse>('/api/products/categories/all'),
};

// ── Admin Product API ─────────────────────────────────────────────────────────

export interface AdminProductsResponse {
  success: boolean;
  products: BackendProduct[];
}

export interface AdminProductResponse {
  success: boolean;
  product: BackendProduct;
  productid?: string;
  message?: string;
}

export const adminApi = {
  getAll: (token: string) =>
    request<AdminProductsResponse>('/api/admin/products', { token }),

  add: (formData: FormData, token: string) =>
    requestFormData<AdminProductResponse>('/api/admin/products', formData, token),

  update: (id: string, body: Partial<BackendProduct>, token: string) =>
    request<AdminProductResponse>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body,
      token,
    }),

  delete: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      token,
    }),

  updateStock: (id: string, stock: number, token: string) =>
    request<AdminProductResponse>(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: { stock },
      token,
    }),

  toggleAvailability: (id: string, token: string) =>
    request<AdminProductResponse>(`/api/admin/products/${id}/availability`, {
      method: 'PATCH',
      token,
    }),
};

// ── Shared types ──────────────────────────────────────────────────────────────

export interface Address {
  _id?: string;
  building?: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  alternatephone?: string;
}

// ── Order API ─────────────────────────────────────────────────────────────────

export interface OrderItem {
  product?: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: Address;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
}

export const orderApi = {
  create: (body: { items: { product: string; quantity: number }[]; shippingAddress: Omit<Address, '_id'>; notes?: string }, token: string) =>
    request<{ success: boolean; order: Order }>('/api/orders', { method: 'POST', body, token }),

  getAll: (token: string) =>
    request<{ success: boolean; orders: Order[] }>('/api/orders', { token }),

  getById: (id: string, token: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}`, { token }),

  cancel: (id: string, reason: string, token: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}/cancel`, { method: 'PATCH', body: { reason }, token }),

  adminGetAll: (token: string) =>
    request<{ success: boolean; orders: Order[] }>('/api/orders/admin/all', { token }),

  adminUpdateStatus: (id: string, status: Order['status'], token: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/admin/${id}/status`, { method: 'PATCH', body: { status }, token }),
};

// ── User Profile API ──────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: Address[];
  createdAt: string;
}

export const userApi = {
  getProfile: (token: string) =>
    request<{ success: boolean; user: UserProfile }>('/api/user/profile', { token }),

  updateProfile: (body: { name?: string; phone?: string }, token: string) =>
    request<{ success: boolean; user: UserProfile }>('/api/user/profile', { method: 'PUT', body, token }),

  addAddress: (body: Omit<Address, '_id'>, token: string) =>
    request<{ success: boolean; address: Address[] }>('/api/user/address', { method: 'POST', body, token }),

  updateAddress: (addressId: string, body: Partial<Address>, token: string) =>
    request<{ success: boolean; address: Address[] }>(`/api/user/address/${addressId}`, { method: 'PUT', body, token }),

  deleteAddress: (addressId: string, token: string) =>
    request<{ success: boolean; address: Address[] }>(`/api/user/address/${addressId}`, { method: 'DELETE', token }),
};

// ── RFQ API ───────────────────────────────────────────────────────────────────

export interface RFQItem {
  _id: string;
  product?: string;
  productName: string;
  quantity: number;
  targetPrice?: number;
  quotedPrice?: number;
  notes?: string;
}

export interface RFQ {
  _id: string;
  rfqNumber: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  items: RFQItem[];
  totalEstimatedValue: number;
  notes?: string;
  adminNotes?: string;
  expiresAt?: string;
  createdAt: string;
}

export const rfqApi = {
  create: (body: { notes?: string; expiresAt?: string }, token: string) =>
    request<{ success: boolean; rfq: RFQ }>('/api/rfqs', { method: 'POST', body, token }),

  getAll: (token: string, status?: string) =>
    request<{ success: boolean; rfqs: RFQ[] }>(`/api/rfqs${status ? `?status=${status}` : ''}`, { token }),

  getById: (id: string, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/${id}`, { token }),

  addItem: (id: string, body: { productName: string; quantity: number; targetPrice?: number; notes?: string; productId?: string }, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/${id}/items`, { method: 'POST', body, token }),

  updateItem: (id: string, itemId: string, body: { quantity?: number; targetPrice?: number | null; notes?: string }, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/${id}/items/${itemId}`, { method: 'PATCH', body, token }),

  removeItem: (id: string, itemId: string, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/${id}/items/${itemId}`, { method: 'DELETE', token }),

  submit: (id: string, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/${id}/submit`, { method: 'PATCH', token }),

  adminGetAll: (token: string, status?: string) =>
    request<{ success: boolean; rfqs: RFQ[] }>(`/api/rfqs/admin/all${status ? `?status=${status}` : ''}`, { token }),

  adminUpdate: (id: string, body: { status?: string; adminNotes?: string; quotedItems?: { itemId: string; quotedPrice: number }[] }, token: string) =>
    request<{ success: boolean; rfq: RFQ }>(`/api/rfqs/admin/${id}`, { method: 'PATCH', body, token }),
};

// ── Shipment API ──────────────────────────────────────────────────────────────

export interface ShipmentEvent {
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

export interface Shipment {
  _id: string;
  trackingNumber: string;
  carrier?: string;
  status: 'PREPARING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  origin?: string;
  destination?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  freightClass?: string;
  weight?: number;
  events: ShipmentEvent[];
  order?: { orderNumber: string; totalAmount: number };
  createdAt: string;
}

export const shipmentApi = {
  getAll: (token: string) =>
    request<{ success: boolean; shipments: Shipment[] }>('/api/shipments', { token }),

  track: (identifier: string, token: string) =>
    request<{ success: boolean; shipment: Shipment }>(`/api/shipments/track/${identifier}`, { token }),

  adminGetAll: (token: string) =>
    request<{ success: boolean; shipments: Shipment[] }>('/api/shipments/admin/all', { token }),

  adminCreate: (body: { orderId?: string; userId: string; carrier?: string; origin?: string; destination?: string; estimatedDelivery?: string; freightClass?: string; weight?: number }, token: string) =>
    request<{ success: boolean; shipment: Shipment }>('/api/shipments/admin', { method: 'POST', body, token }),

  adminUpdate: (id: string, body: { status?: Shipment['status']; location?: string; description?: string }, token: string) =>
    request<{ success: boolean; shipment: Shipment }>(`/api/shipments/admin/${id}`, { method: 'PATCH', body, token }),
};

// ── Compliance API ────────────────────────────────────────────────────────────

export interface ComplianceDoc {
  _id: string;
  title: string;
  type: 'ISO' | 'CE' | 'RoHS' | 'REACH' | 'SDS' | 'AUDIT' | 'OTHER';
  documentUrl?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  notes?: string;
  product?: { _id: string; productName: string; category: string };
  createdAt: string;
}

async function uploadComplianceDoc(formData: FormData, token: string) {
  const res = await fetch(`${BASE_URL}/api/compliance`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data as { success: boolean; doc: ComplianceDoc };
}

export const complianceApi = {
  upload: uploadComplianceDoc,

  getAll: (token: string, params?: { type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ success: boolean; docs: ComplianceDoc[] }>(`/api/compliance${query}`, { token });
  },

  delete: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/compliance/${id}`, { method: 'DELETE', token }),

  adminGetAll: (token: string, params?: { type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ success: boolean; docs: ComplianceDoc[] }>(`/api/compliance/admin/all${query}`, { token });
  },
};

// ── Specs API ─────────────────────────────────────────────────────────────────

export interface SpecSheet {
  _id: string;
  title: string;
  fileUrl?: string;
  fileType: 'PDF' | 'CAD' | 'XLSX' | 'DWG' | 'OTHER';
  fileSize?: string;
  version: string;
  description?: string;
  product?: { _id: string; productName: string; category: string; materialSpecifications?: string };
  uploadedBy?: { name: string };
  createdAt: string;
}

export const specsApi = {
  getAll: (params?: { fileType?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.fileType) qs.set('fileType', params.fileType);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ success: boolean; specs: SpecSheet[]; total: number }>(`/api/specs${query}`);
  },

  getByProduct: (productId: string) =>
    request<{ success: boolean; specs: SpecSheet[] }>(`/api/specs/product/${productId}`),

  adminUpload: (formData: FormData, token: string) =>
    requestFormData<{ success: boolean; spec: SpecSheet }>('/api/specs/admin', formData, token),

  adminDelete: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/specs/admin/${id}`, { method: 'DELETE', token }),
};
