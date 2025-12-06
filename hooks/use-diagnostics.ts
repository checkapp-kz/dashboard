import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DiagnosticTemplate, TestType } from "@/lib/types";

interface CreateDiagnosticDto {
  name: string;
  description?: string;
  codes: string[];
  codesUnionCombinations?: string[][];
  testType: TestType;
  isActive?: boolean;
  orderIndex?: number;
}

type UpdateDiagnosticDto = Partial<CreateDiagnosticDto>;

export function useDiagnostics(testType?: TestType) {
  return useQuery({
    queryKey: ["diagnostics", testType],
    queryFn: async () => {
      const params = testType ? { testType } : {};
      const { data } = await api.get<DiagnosticTemplate[]>(
        "/admin-data/diagnostics",
        { params }
      );
      return data;
    },
  });
}

export function useDiagnostic(id: string) {
  return useQuery({
    queryKey: ["diagnostics", id],
    queryFn: async () => {
      const { data } = await api.get<DiagnosticTemplate>(
        `/admin-data/diagnostics/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateDiagnosticDto) => {
      const { data } = await api.post<DiagnosticTemplate>(
        "/admin-data/diagnostics",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
    },
  });
}

export function useUpdateDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: UpdateDiagnosticDto & { id: string }) => {
      const { data } = await api.put<DiagnosticTemplate>(
        `/admin-data/diagnostics/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
    },
  });
}

export function useDeleteDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin-data/diagnostics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
    },
  });
}
