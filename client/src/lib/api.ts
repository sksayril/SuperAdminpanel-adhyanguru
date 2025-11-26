// API Base URL
export const API_BASE_URL = "https://7bb3rgsz-3000.inc1.devtunnels.ms";

// Get token from localStorage
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// Set token in localStorage
export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

// Remove token from localStorage
export function removeToken(): void {
  localStorage.removeItem("token");
}

// Get user data from localStorage
export function getUser(): { id: string; name: string; email: string; role: string } | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Set user data in localStorage
export function setUser(user: { id: string; name: string; email: string; role: string }): void {
  localStorage.setItem("user", JSON.stringify(user));
}

// Remove user data from localStorage
export function removeUser(): void {
  localStorage.removeItem("user");
}

// API Request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Request helper for multipart/form-data (file uploads)
export async function apiRequestMultipart<T>(
  endpoint: string,
  formData: FormData,
  method: string = "POST"
): Promise<T> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {};
  // Don't set Content-Type for FormData - browser will set it with boundary

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Super Admin Signup
export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export async function signup(data: SignupData): Promise<SignupResponse> {
  return apiRequest<SignupResponse>("/api/super-admin/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Super Admin Login
export interface SigninData {
  email: string;
  password: string;
}

export interface SigninResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string;
    token: string;
  };
}

export async function signin(data: SigninData): Promise<SigninResponse> {
  return apiRequest<SigninResponse>("/api/super-admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Super Admin List
export interface SuperAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SuperAdminListResponse {
  success: boolean;
  data: SuperAdmin[];
}

export async function getSuperAdmins(): Promise<SuperAdminListResponse> {
  return apiRequest<SuperAdminListResponse>("/api/super-admin", {
    method: "GET",
  });
}

// Super Admin Profile
export interface SuperAdminProfileResponse {
  success: boolean;
  data: SuperAdmin;
}

export async function getSuperAdminProfile(): Promise<SuperAdminProfileResponse> {
  return apiRequest<SuperAdminProfileResponse>("/api/super-admin/profile", {
    method: "GET",
  });
}

// Admin Management (Regular Admins, not Super Admins)
export interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateAdminData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateAdminData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  data: Admin;
}

export interface UpdateAdminResponse {
  success: boolean;
  message: string;
  data: Admin;
}

export interface AdminListResponse {
  success: boolean;
  data: Admin[];
}

export async function createAdmin(data: CreateAdminData): Promise<CreateAdminResponse> {
  return apiRequest<CreateAdminResponse>("/api/admins", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdmin(id: string, data: UpdateAdminData): Promise<UpdateAdminResponse> {
  return apiRequest<UpdateAdminResponse>(`/api/admins/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface DeleteAdminResponse {
  success: boolean;
  message: string;
}

export async function deleteAdmin(id: string): Promise<DeleteAdminResponse> {
  return apiRequest<DeleteAdminResponse>(`/api/admins/${id}/delete`, {
    method: "POST",
  });
}

export async function getAdmins(): Promise<AdminListResponse> {
  return apiRequest<AdminListResponse>("/api/admins", {
    method: "GET",
  });
}

// Regular Users (Students and Instructors)
export interface RegularUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  fullName: string;
}

export interface UserListResponse {
  success?: boolean;
  data?: RegularUser[];
}

export async function getUsers(): Promise<RegularUser[] | UserListResponse> {
  return apiRequest<RegularUser[] | UserListResponse>("/api/users", {
    method: "GET",
  });
}

// Agent Management
export interface AgentArea {
  areaname: string;
  city: string;
  pincode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  area: AgentArea;
  role?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  parentAgent?: string;
  parentAgentName?: string;
  image?: string; // Profile image URL
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateAgentData {
  name: string;
  email: string;
  phone: string;
  password: string;
  area: AgentArea;
  image?: File; // Optional image file
}

export interface UpdateAgentData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  area?: AgentArea;
  image?: File; // Optional image file
}

export interface CreateAgentResponse {
  success: boolean;
  message: string;
  data: Agent;
}

export interface UpdateAgentResponse {
  success: boolean;
  message: string;
  data: Agent;
}

export interface DeleteAgentResponse {
  success: boolean;
  message: string;
}

export interface AgentListResponse {
  success: boolean;
  data: Agent[];
}

export async function createAgent(data: CreateAgentData): Promise<CreateAgentResponse> {
  const formData = new FormData();
  
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone);
  formData.append("password", data.password);
  formData.append("area", JSON.stringify(data.area));
  
  if (data.image) {
    formData.append("image", data.image);
  }

  return apiRequestMultipart<CreateAgentResponse>("/api/agents", formData, "POST");
}

export async function updateAgent(id: string, data: UpdateAgentData): Promise<UpdateAgentResponse> {
  const formData = new FormData();
  
  if (data.name) formData.append("name", data.name);
  if (data.email) formData.append("email", data.email);
  if (data.phone) formData.append("phone", data.phone);
  if (data.password) formData.append("password", data.password);
  if (data.area) formData.append("area", JSON.stringify(data.area));
  
  if (data.image) {
    formData.append("image", data.image);
  }

  return apiRequestMultipart<UpdateAgentResponse>(`/api/agents/${id}`, formData, "PUT");
}

export async function deleteAgent(id: string): Promise<DeleteAgentResponse> {
  return apiRequest<DeleteAgentResponse>(`/api/agents/${id}/delete`, {
    method: "POST",
  });
}

export async function getAgents(): Promise<AgentListResponse> {
  return apiRequest<AgentListResponse>("/api/agents", {
    method: "GET",
  });
}

// Logout
export interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/api/super-admin/logout", {
    method: "POST",
  });
}

