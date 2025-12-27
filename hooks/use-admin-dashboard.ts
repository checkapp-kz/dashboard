import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { UserListResponse, StatisticsResponse } from "@/lib/types";

interface UsersQueryParams {
  email?: string;
  page?: number;
  limit?: number;
}

export function useAdminUsers(params: UsersQueryParams = {}) {
  const { email, page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ["adminUsers", email, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (email) queryParams.set("email", email);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));

      const { data } = await api.get<UserListResponse>(
        `/admin-data/dashboard/users?${queryParams.toString()}`
      );
      return data;
    },
  });
}

export function useAdminStatistics() {
  return useQuery({
    queryKey: ["adminStatistics"],
    queryFn: async () => {
      const { data } = await api.get<StatisticsResponse>(
        "/admin-data/dashboard/statistics"
      );
      return data;
    },
  });
}
