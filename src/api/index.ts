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
