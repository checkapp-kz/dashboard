import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AnalysisTemplate, TestType } from "@/lib/types";

interface CreateAnalysisDto {
  name: string;
  description?: string;
  codes: string[];
  codesUnionCombinations?: string[][];
  invitroCode?: string;
  invitroPrice?: number;
  specialPrice?: number;
  price?: number;
  testType: TestType;
  isActive?: boolean;
  orderIndex?: number;
}

type UpdateAnalysisDto = Partial<CreateAnalysisDto>;

export function useAnalyses(testType?: TestType) {
  return useQuery({
    queryKey: ["analyses", testType],
    queryFn: async () => {
      const params = testType ? { testType } : {};
      const { data } = await api.get<AnalysisTemplate[]>(
        "/admin-data/analyses",
        { params }
      );
      return data;
    },
  });
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ["analyses", id],
    queryFn: async () => {
      const { data } = await api.get<AnalysisTemplate>(
        `/admin-data/analyses/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAnalysisDto) => {
      const { data } = await api.post<AnalysisTemplate>(
        "/admin-data/analyses",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useUpdateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: UpdateAnalysisDto & { id: string }) => {
      const { data } = await api.put<AnalysisTemplate>(
        `/admin-data/analyses/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin-data/analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}
