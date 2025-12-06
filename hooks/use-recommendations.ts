import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RecommendationTemplate, TestType } from "@/lib/types";

interface CreateRecommendationDto {
  name: string;
  content: string;
  testType: TestType;
  isActive?: boolean;
  orderIndex?: number;
}

type UpdateRecommendationDto = Partial<CreateRecommendationDto>;

export function useRecommendations(testType?: TestType) {
  return useQuery({
    queryKey: ["recommendations", testType],
    queryFn: async () => {
      const params = testType ? { testType } : {};
      const { data } = await api.get<RecommendationTemplate[]>(
        "/admin-data/recommendations",
        { params }
      );
      return data;
    },
  });
}

export function useRecommendation(id: string) {
  return useQuery({
    queryKey: ["recommendations", id],
    queryFn: async () => {
      const { data } = await api.get<RecommendationTemplate>(
        `/admin-data/recommendations/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateRecommendationDto) => {
      const { data } = await api.post<RecommendationTemplate>(
        "/admin-data/recommendations",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useUpdateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: UpdateRecommendationDto & { id: string }) => {
      const { data } = await api.put<RecommendationTemplate>(
        `/admin-data/recommendations/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useDeleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin-data/recommendations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
