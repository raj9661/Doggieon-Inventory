import { useQuery as useReactQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import Cookies from "js-cookie"

interface QueryConfig<T> extends Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> {
  url: string
  params?: Record<string, any>
}

export function useQuery<T>({ url, params, ...config }: QueryConfig<T>): UseQueryResult<T, Error> {
  return useReactQuery({
    queryKey: [url, params],
    queryFn: async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        console.log(`API Response for ${url}:`, data)
        return data
      } catch (error) {
        console.error(`API Error for ${url}:`, error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    ...config,
  })
}

interface MutationConfig<T, R> {
  url: string
  method: 'post' | 'put' | 'delete'
  onSuccess?: (data: R) => void
  onError?: (error: Error) => void
}

export function useMutation<T, R>({ url, method, onSuccess, onError }: MutationConfig<T, R>) {
  const mutate = async (data?: T): Promise<R> => {
    try {
      let response
      switch (method) {
        case 'post':
          response = await apiClient.post<R>(url, data)
          break
        case 'put':
          response = await apiClient.put<R>(url, data)
          break
        case 'delete':
          response = await apiClient.delete<R>(url)
          break
      }
      onSuccess?.(response)
      return response
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  return { mutate }
} 