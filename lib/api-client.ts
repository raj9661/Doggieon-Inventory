import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

class ApiClient {
  private static instance: ApiClient
  private client: AxiosInstance
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTTL: number = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new Map()
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private getCacheKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}`
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL
  }

  private async makeRequest(config: AxiosRequestConfig) {
    const cacheKey = this.getCacheKey(config)

    // Return cached data if valid
    const cachedData = this.cache.get(cacheKey)
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data
    }

    try {
      const response = await this.client.request(config)
      
      // Cache successful GET requests
      if (config.method?.toLowerCase() === 'get') {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        })
      }

      return response.data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest({ ...config, method: 'get', url })
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest({ ...config, method: 'post', url, data })
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest({ ...config, method: 'put', url, data })
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest({ ...config, method: 'delete', url })
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public invalidateCache(url: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(url)) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiClient = ApiClient.getInstance() 