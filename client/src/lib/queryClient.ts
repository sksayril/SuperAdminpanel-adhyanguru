import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL, getToken } from "./api";
import { mockApiRequest } from "./mockData";

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    
    // Use real API for authenticated endpoints, mock data for others
    const token = getToken();
    const isAuthEndpoint = endpoint.includes("/signin") || endpoint.includes("/signup");
    
    // If we have a token and it's not an auth endpoint, use real API
    if (token && !isAuthEndpoint) {
      try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.status === 401 && unauthorizedBehavior === "returnNull") {
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        // Fallback to mock data if API fails
        console.warn(`API request failed for ${endpoint}, using mock data:`, error);
        return await mockApiRequest(endpoint);
      }
    }
    
    // Use mock data for non-authenticated requests or when no token
    const data = await mockApiRequest(endpoint);
    
    if (data === null && unauthorizedBehavior === "returnNull") {
      return null;
    }
    
    if (data === null) {
      throw new Error(`404: Data not found for ${endpoint}`);
    }
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
