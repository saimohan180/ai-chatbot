"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing user on mount
    const savedUser = localStorage.getItem("ai-tutor-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem("ai-tutor-users") || "[]")
      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem("ai-tutor-user", JSON.stringify(foundUser))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem("ai-tutor-users") || "[]")
      const existingUser = users.find((u: any) => u.email === email)

      if (existingUser) {
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name: email.split("@")[0],
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("ai-tutor-users", JSON.stringify(users))
      setUser(newUser)
      localStorage.setItem("ai-tutor-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ai-tutor-user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
