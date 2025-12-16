import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  CheckupTemplate,
  CreateCheckupTemplateDto,
  UpdateCheckupTemplateDto,
} from "@/lib/types";

export function useCheckupTemplates(activeOnly?: boolean) {
  return useQuery({
    queryKey: ["checkupTemplates", activeOnly],
    queryFn: async () => {
      const endpoint = activeOnly
        ? "/checkup-template/active"
        : "/checkup-template";
      const { data } = await api.get<CheckupTemplate[]>(endpoint);
      return data;
    },
  });
}

export function useCheckupTemplate(id: string) {
  return useQuery({
    queryKey: ["checkupTemplates", id],
    queryFn: async () => {
      const { data } = await api.get<CheckupTemplate>(
        `/checkup-template/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCheckupTemplateByKey(testKey: string) {
  return useQuery({
    queryKey: ["checkupTemplates", "key", testKey],
    queryFn: async () => {
      const { data } = await api.get<CheckupTemplate>(
        `/checkup-template/key/${testKey}`
      );
      return data;
    },
    enabled: !!testKey,
  });
}

export function useCreateCheckupTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCheckupTemplateDto) => {
      const { data } = await api.post<CheckupTemplate>(
        "/checkup-template",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkupTemplates"] });
    },
  });
}

export function useUpdateCheckupTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: UpdateCheckupTemplateDto & { id: string }) => {
      const { data } = await api.put<CheckupTemplate>(
        `/checkup-template/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkupTemplates"] });
    },
  });
}

export function useToggleCheckupTemplateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<CheckupTemplate>(
        `/checkup-template/${id}/toggle-active`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkupTemplates"] });
    },
  });
}

export function useDeleteCheckupTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/checkup-template/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkupTemplates"] });
    },
  });
}
