"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (token && storedUser) {
        try {
          // Validate token
          await api.get("/auth/validate")
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } catch (error) {
          // Invalid token
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setUser(user)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
