const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://credit-sea-backend-pi.vercel.app/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
  status?: number;
}

/**
 * Centrailized fetch utility for backend APIs
 */
export const fetchApi = async <T = any>(
  path: string,
  options: RequestInit & { isFormData?: boolean } = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  // Automatically inject token if stored in local storage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('creditsea_lms_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Set default content type to JSON unless it's a multipart form upload
  if (!options.isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const error: ApiError = {
        success: false,
        message: data.error || data.message || `HTTP error! Status: ${response.status}`,
        errors: data.errors,
        status: response.status,
      };
      throw error;
    }

    return data as T;
  } catch (err: any) {
    if (err.status) {
      throw err;
    }
    throw {
      success: false,
      message: err.message || 'Network connection failed. Please ensure the backend is running.',
    } as ApiError;
  }
};

export const api = {
  get: <T = any>(path: string, options?: RequestInit) =>
    fetchApi<T>(path, { ...options, method: 'GET' }),
    
  post: <T = any>(path: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  upload: <T = any>(path: string, formData: FormData, options?: RequestInit) =>
    fetchApi<T>(path, {
      ...options,
      method: 'POST',
      body: formData,
      isFormData: true,
    }),
};
