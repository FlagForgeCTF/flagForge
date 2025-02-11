import { useMutation, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/utils/api';
import { AxiosError } from 'axios';
import { ErrorResponseI } from '@/types/context';
// import { Navigate } from 'react-router-dom';

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


interface FormData {
    flag: string;
}


export function usePostProblem(id: string) {
    return useMutation<FormData, AxiosError<ErrorResponseI>, FormData>({
        mutationFn: async formData => {
            const response = await api.post(endpoints.problems.solve(id), formData);
            return response.data;
        },
    });
}