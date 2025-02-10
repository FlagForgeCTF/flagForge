import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/utils/api';

export function useGetAllProblems(page: number) {
    return useQuery({
        queryKey: ['problems', page],
        queryFn: async () => {
            const response = await api.get(endpoints.problems.all(page), {
                withCredentials: true,
            });

            return response.data;
        },
        retry: 1,
    });
}

export function useGetAProblem(id: string) {
    return useQuery({
        queryKey: ['problem', id],
        queryFn: async () => {
            const response = await api.get(endpoints.problems.one(id), {
                withCredentials: true,
            });
            return response.data;
        },
        retry: 1
    });
}