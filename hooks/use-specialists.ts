import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { SpecialistTemplate, TestType } from "@/lib/types";

interface CreateSpecialistDto {
  name: string;
  codes: string[];
  codesUnionCombinations?: string[][];
  testType: TestType;
  isActive?: boolean;
  orderIndex?: number;
}

type UpdateSpecialistDto = Partial<CreateSpecialistDto>;

export function useSpecialists(testType?: TestType) {
  return useQuery({
    queryKey: ["specialists", testType],
    queryFn: async () => {
      const params = testType ? { testType } : {};
      const { data } = await api.get<SpecialistTemplate[]>(
        "/admin-data/specialists",
        { params }
      );
      return data;
    },
  });
}

export function useSpecialist(id: string) {
  return useQuery({
    queryKey: ["specialists", id],
    queryFn: async () => {
      const { data } = await api.get<SpecialistTemplate>(
        `/admin-data/specialists/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSpecialist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateSpecialistDto) => {
      const { data } = await api.post<SpecialistTemplate>(
        "/admin-data/specialists",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}

export function useUpdateSpecialist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: UpdateSpecialistDto & { id: string }) => {
      const { data } = await api.put<SpecialistTemplate>(
        `/admin-data/specialists/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}

export function useDeleteSpecialist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin-data/specialists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}
