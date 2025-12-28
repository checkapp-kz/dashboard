import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  DoctorApplicationsResponse,
  DoctorApplicationsStats,
  DoctorApplicationsQueryParams,
  DoctorApplication,
} from "@/lib/types";

export function useDoctorApplications(params: DoctorApplicationsQueryParams = {}) {
  const { status, page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ["doctorApplications", status, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));

      const { data } = await api.get<DoctorApplicationsResponse>(
        `/admin-data/doctor-applications?${queryParams.toString()}`
      );
      return data;
    },
  });
}

export function useDoctorApplicationsStats() {
  return useQuery({
    queryKey: ["doctorApplicationsStats"],
    queryFn: async () => {
      const { data } = await api.get<DoctorApplicationsStats>(
        "/admin-data/doctor-applications/stats"
      );
      return data;
    },
  });
}

export function useDoctorApplicationDetails(doctorId: string | null) {
  return useQuery({
    queryKey: ["doctorApplicationDetails", doctorId],
    queryFn: async () => {
      const { data } = await api.get<DoctorApplication>(
        `/admin-data/doctor-applications/${doctorId}`
      );
      return data;
    },
    enabled: !!doctorId,
  });
}

export function useToggleDoctorVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, isDoctorVerified }: { doctorId: string; isDoctorVerified: boolean }) => {
      const { data } = await api.patch(
        `/admin-data/doctor-applications/${doctorId}/status`,
        { isDoctorVerified }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["doctorApplicationsStats"] });
    },
  });
}
