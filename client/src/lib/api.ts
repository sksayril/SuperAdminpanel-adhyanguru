// API Base URL
export const API_BASE_URL = "https://7cvccltb-3000.inc1.devtunnels.ms";

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
  data: Admin[] | {
    items: Admin[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export async function createAdmin(data: CreateAdminData): Promise<CreateAdminResponse> {
  return apiRequest<CreateAdminResponse>("/api/super-admin/admins", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdmin(id: string, data: UpdateAdminData): Promise<UpdateAdminResponse> {
  return apiRequest<UpdateAdminResponse>(`/api/super-admin/admins/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface DeleteAdminResponse {
  success: boolean;
  message: string;
}

export async function deleteAdmin(id: string): Promise<DeleteAdminResponse> {
  return apiRequest<DeleteAdminResponse>(`/api/super-admin/admins/${id}`, {
    method: "DELETE",
  });
}

export async function getAdmins(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}): Promise<AdminListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.search) queryParams.append("search", params.search);
  
  const query = queryParams.toString();
  return apiRequest<AdminListResponse>(`/api/super-admin/admins${query ? `?${query}` : ""}`, {
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
  data: Agent[] | {
    items: Agent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
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

  return apiRequestMultipart<CreateAgentResponse>("/api/super-admin/agents", formData, "POST");
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

  return apiRequestMultipart<UpdateAgentResponse>(`/api/super-admin/agents/${id}`, formData, "PUT");
}

export async function deleteAgent(id: string): Promise<DeleteAgentResponse> {
  return apiRequest<DeleteAgentResponse>(`/api/super-admin/agents/${id}`, {
    method: "DELETE",
  });
}

export async function getAgents(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  parentAgent?: string;
  search?: string;
}): Promise<AgentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.parentAgent) queryParams.append("parentAgent", params.parentAgent);
  if (params?.search) queryParams.append("search", params.search);
  
  const query = queryParams.toString();
  return apiRequest<AgentListResponse>(`/api/super-admin/agents${query ? `?${query}` : ""}`, {
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

// ==================== COUPON MANAGEMENT ====================

export interface Coupon {
  _id: string;
  code: string;
  discountType: "flat" | "percent";
  discountValue: number;
  validFrom: string;
  validTill: string;
  maxUsage: number;
  usedCount: number;
  applicablePlan: "monthly" | "quarterly" | "yearly" | "all";
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  usedBy?: string[];
  isExpired?: boolean;
  isUsageLimitReached?: boolean;
  isValid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  discountType: "flat" | "percent";
  discountValue: number;
  validFrom?: string;
  validTill: string;
  maxUsage?: number;
  applicablePlan?: "monthly" | "quarterly" | "yearly" | "all";
  code?: string;
  isActive?: boolean;
}

export interface UpdateCouponData {
  discountValue?: number;
  validTill?: string;
  maxUsage?: number;
  applicablePlan?: "monthly" | "quarterly" | "yearly" | "all";
  isActive?: boolean;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface CouponListResponse {
  success: boolean;
  message: string;
  data: {
    items: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export async function createCoupon(data: CreateCouponData): Promise<CouponResponse> {
  return apiRequest<CouponResponse>("/api/superadmin/coupons/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCoupons(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  applicablePlan?: string;
}): Promise<CouponListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.applicablePlan) queryParams.append("applicablePlan", params.applicablePlan);
  
  const query = queryParams.toString();
  return apiRequest<CouponListResponse>(`/api/superadmin/coupons${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function updateCoupon(id: string, data: UpdateCouponData): Promise<CouponResponse> {
  return apiRequest<CouponResponse>(`/api/superadmin/coupons/${id}/update`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== SUBSCRIPTION PLAN MANAGEMENT ====================

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description?: string;
  planType: "monthly" | "quarterly" | "yearly";
  price: number;
  originalPrice?: number;
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanData {
  name: string;
  description?: string;
  planType: "monthly" | "quarterly" | "yearly";
  price: number;
  originalPrice?: number;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  description?: string;
  planType?: "monthly" | "quarterly" | "yearly";
  price?: number;
  originalPrice?: number;
  features?: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface SubscriptionPlanResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan;
}

export interface SubscriptionPlanListResponse {
  success: boolean;
  message: string;
  data: {
    items: SubscriptionPlan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export async function createSubscriptionPlan(data: CreateSubscriptionPlanData): Promise<SubscriptionPlanResponse> {
  return apiRequest<SubscriptionPlanResponse>("/api/superadmin/subscription-plans/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSubscriptionPlans(params?: {
  page?: number;
  limit?: number;
  planType?: string;
  isActive?: boolean;
}): Promise<SubscriptionPlanListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.planType) queryParams.append("planType", params.planType);
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  
  const query = queryParams.toString();
  return apiRequest<SubscriptionPlanListResponse>(`/api/superadmin/subscription-plans${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlanResponse> {
  return apiRequest<SubscriptionPlanResponse>(`/api/superadmin/subscription-plans/${id}`, {
    method: "GET",
  });
}

export async function updateSubscriptionPlan(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlanResponse> {
  return apiRequest<SubscriptionPlanResponse>(`/api/superadmin/subscription-plans/${id}/update`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteSubscriptionPlan(id: string): Promise<SubscriptionPlanResponse> {
  return apiRequest<SubscriptionPlanResponse>(`/api/superadmin/subscription-plans/${id}/delete`, {
    method: "POST",
  });
}

// ==================== COMMISSION PLAN MANAGEMENT ====================

export interface CommissionPlan {
  _id: string;
  name: string;
  description?: string;
  level1_pct: number;
  level2_pct: number;
  level3_pct: number;
  platform_pct: number;
  auto_calculate_platform: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionPlanData {
  name: string;
  description?: string;
  level1_pct: number;
  level2_pct: number;
  level3_pct: number;
  platform_pct?: number;
  auto_calculate_platform?: boolean;
  is_active?: boolean;
}

export interface UpdateCommissionPlanData {
  name?: string;
  description?: string;
  level1_pct?: number;
  level2_pct?: number;
  level3_pct?: number;
  platform_pct?: number;
  auto_calculate_platform?: boolean;
  is_active?: boolean;
}

export interface CommissionPlanResponse {
  success: boolean;
  message: string;
  data: CommissionPlan;
}

export interface CommissionPlanListResponse {
  success: boolean;
  data: CommissionPlan[];
}

export interface AgentPlan {
  _id: string;
  agentId: string;
  planId: string;
  agent?: Agent;
  plan?: CommissionPlan;
  assignedAt: string;
}

export interface AssignPlanData {
  agentId: string;
  planId: string;
}

export interface AgentPlanListResponse {
  success: boolean;
  data: AgentPlan[];
}

export async function createCommissionPlan(data: CreateCommissionPlanData): Promise<CommissionPlanResponse> {
  return apiRequest<CommissionPlanResponse>("/api/super-admin/commission-plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCommissionPlans(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}): Promise<CommissionPlanListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
  
  const query = queryParams.toString();
  return apiRequest<CommissionPlanListResponse>(`/api/super-admin/commission-plans${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getCommissionPlanById(id: string): Promise<CommissionPlanResponse> {
  return apiRequest<CommissionPlanResponse>(`/api/super-admin/commission-plans/${id}`, {
    method: "GET",
  });
}

export async function updateCommissionPlan(id: string, data: UpdateCommissionPlanData): Promise<CommissionPlanResponse> {
  return apiRequest<CommissionPlanResponse>(`/api/super-admin/commission-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCommissionPlan(id: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/api/super-admin/commission-plans/${id}`, {
    method: "DELETE",
  });
}

export async function assignPlanToAgent(data: AssignPlanData): Promise<{ success: boolean; message: string; data: AgentPlan }> {
  return apiRequest<{ success: boolean; message: string; data: AgentPlan }>("/api/super-admin/agent-plans/assign", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAgentPlans(params?: {
  page?: number;
  limit?: number;
  agentId?: string;
  planId?: string;
}): Promise<AgentPlanListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.agentId) queryParams.append("agentId", params.agentId);
  if (params?.planId) queryParams.append("planId", params.planId);
  
  const query = queryParams.toString();
  return apiRequest<AgentPlanListResponse>(`/api/super-admin/agent-plans${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function removePlanFromAgent(data: AssignPlanData): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/api/super-admin/agent-plans/remove", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== WALLET MANAGEMENT ====================

export interface AgentWallet {
  _id: string;
  agentId: string;
  agent?: Agent;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  walletId: string;
  type: "credit" | "debit";
  amount: number;
  category: "topup" | "withdrawal" | "commission" | "adjustment" | "refund";
  status: "pending" | "success" | "failed" | "cancelled";
  note?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  _id: string;
  agentId: string;
  agent?: Agent;
  amount: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "processing";
  reason?: string;
  transactionId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletListResponse {
  success: boolean;
  data: {
    items: AgentWallet[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface WalletResponse {
  success: boolean;
  data: AgentWallet;
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    items: WalletTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CreditDebitData {
  amount: number;
  category: "topup" | "withdrawal" | "commission" | "adjustment" | "refund";
  note?: string;
  paymentReference?: string;
}

export interface WithdrawalListResponse {
  success: boolean;
  data: {
    items: WithdrawalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface WalletStatistics {
  totalWallets: number;
  totalBalance: number;
  totalEarned: number;
  pendingWithdrawals: number;
  totalTransactions: number;
}

export interface WalletStatsResponse {
  success: boolean;
  data: WalletStatistics;
}

export async function getAllAgentWallets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  minBalance?: number;
  maxBalance?: number;
}): Promise<WalletListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.minBalance) queryParams.append("minBalance", params.minBalance.toString());
  if (params?.maxBalance) queryParams.append("maxBalance", params.maxBalance.toString());
  
  const query = queryParams.toString();
  return apiRequest<WalletListResponse>(`/api/super-admin/wallets${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getAgentWallet(agentId: string): Promise<WalletResponse> {
  return apiRequest<WalletResponse>(`/api/super-admin/wallets/agents/${agentId}`, {
    method: "GET",
  });
}

export async function getAgentWalletTransactions(agentId: string, params?: {
  page?: number;
  limit?: number;
  type?: "credit" | "debit";
  category?: string;
  status?: string;
  from?: string;
  to?: string;
}): Promise<TransactionListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.type) queryParams.append("type", params.type);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.from) queryParams.append("from", params.from);
  if (params?.to) queryParams.append("to", params.to);
  
  const query = queryParams.toString();
  return apiRequest<TransactionListResponse>(`/api/super-admin/wallets/agents/${agentId}/transactions${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function creditAgentWallet(agentId: string, data: CreditDebitData): Promise<{ success: boolean; message: string; data: WalletTransaction }> {
  return apiRequest<{ success: boolean; message: string; data: WalletTransaction }>(`/api/super-admin/wallets/agents/${agentId}/credit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function debitAgentWallet(agentId: string, data: CreditDebitData): Promise<{ success: boolean; message: string; data: WalletTransaction }> {
  return apiRequest<{ success: boolean; message: string; data: WalletTransaction }>(`/api/super-admin/wallets/agents/${agentId}/debit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWithdrawalRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
}): Promise<WithdrawalListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.agentId) queryParams.append("agentId", params.agentId);
  
  const query = queryParams.toString();
  return apiRequest<WithdrawalListResponse>(`/api/super-admin/withdrawals${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function approveWithdrawal(id: string, data: { transactionId?: string; note?: string }): Promise<{ success: boolean; message: string; data: WithdrawalRequest }> {
  return apiRequest<{ success: boolean; message: string; data: WithdrawalRequest }>(`/api/super-admin/withdrawals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function rejectWithdrawal(id: string, data: { reason: string }): Promise<{ success: boolean; message: string; data: WithdrawalRequest }> {
  return apiRequest<{ success: boolean; message: string; data: WithdrawalRequest }>(`/api/super-admin/withdrawals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWalletStatistics(): Promise<WalletStatsResponse> {
  return apiRequest<WalletStatsResponse>("/api/super-admin/wallets/statistics", {
    method: "GET",
  });
}

// ==================== DASHBOARD & ANALYTICS ====================

export interface DashboardOverview {
  overview: {
    totalStudents: number;
    totalAgents: number;
    totalAdmins: number;
    activeSubscriptions: number;
    totalRevenue: number;
    pendingWithdrawals: number;
  };
  growth: {
    currentPeriod: number;
    previousPeriod: number;
    growthRate: number;
  };
  activeUsers: {
    students: number;
    agents: number;
    admins: number;
    total: number;
  };
  period: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
}

export interface SubscriptionGrowthData {
  _id: {
    day?: number;
    week?: number;
    month?: number;
    year: number;
  };
  count: number;
  revenue: number;
}

export interface SubscriptionGrowthResponse {
  success: boolean;
  data: {
    growth: SubscriptionGrowthData[];
    period: number;
    groupBy: string;
  };
}

export interface PopularSubscription {
  planType: string;
  planName: string;
  count: number;
  revenue: number;
  avgAmount: number;
  percentage: string;
}

export interface PopularSubscriptionsResponse {
  success: boolean;
  data: {
    plans: PopularSubscription[];
    period: number;
  };
}

export interface ActiveUsersAnalysis {
  activeUsers: {
    students: number;
    agents: number;
    admins: number;
    total: number;
  };
  loginActivity: Array<{
    _id: {
      day: number;
      month: number;
      year: number;
    };
    count: number;
  }>;
  period: number;
}

export interface ActiveUsersResponse {
  success: boolean;
  data: ActiveUsersAnalysis;
}

export interface RevenueData {
  _id: {
    date: number;
    month: number;
    year: number;
  };
  revenue: number;
  count: number;
  avgAmount: number;
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data: {
    revenue: RevenueData[];
    totalRevenue: number;
    period: number;
    groupBy: string;
  };
}

export async function getDashboardOverview(period?: number): Promise<DashboardOverviewResponse> {
  const query = period ? `?period=${period}` : "";
  return apiRequest<DashboardOverviewResponse>(`/api/super-admin/dashboard${query}`, {
    method: "GET",
  });
}

export async function getSubscriptionGrowth(params?: {
  period?: number;
  groupBy?: "day" | "week" | "month";
}): Promise<SubscriptionGrowthResponse> {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append("period", params.period.toString());
  if (params?.groupBy) queryParams.append("groupBy", params.groupBy);
  
  const query = queryParams.toString();
  return apiRequest<SubscriptionGrowthResponse>(`/api/super-admin/dashboard/subscription-growth${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getPopularSubscriptions(params?: {
  period?: number;
  limit?: number;
}): Promise<PopularSubscriptionsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append("period", params.period.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const query = queryParams.toString();
  return apiRequest<PopularSubscriptionsResponse>(`/api/super-admin/dashboard/popular-subscriptions${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getActiveUsersAnalysis(period?: number): Promise<ActiveUsersResponse> {
  const query = period ? `?period=${period}` : "";
  return apiRequest<ActiveUsersResponse>(`/api/super-admin/dashboard/active-users${query}`, {
    method: "GET",
  });
}

export async function getRevenueAnalytics(params?: {
  period?: number;
  groupBy?: "day" | "week" | "month";
}): Promise<RevenueAnalyticsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append("period", params.period.toString());
  if (params?.groupBy) queryParams.append("groupBy", params.groupBy);
  
  const query = queryParams.toString();
  return apiRequest<RevenueAnalyticsResponse>(`/api/super-admin/dashboard/revenue${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

