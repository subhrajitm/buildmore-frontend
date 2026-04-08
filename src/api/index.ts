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
