"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Brain, Calendar, User } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("ai-tutor-user")
    if (user) {
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem("ai-tutor-users") || "[]")
        const user = users.find((u: any) => u.email === email && u.password === password)

        if (user) {
          localStorage.setItem("ai-tutor-user", JSON.stringify(user))
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password.",
            variant: "destructive",
          })
        }
      } else {
        // Register logic
        const users = JSON.parse(localStorage.getItem("ai-tutor-users") || "[]")
        const existingUser = users.find((u: any) => u.email === email)

        if (existingUser) {
          toast({
            title: "Registration failed",
            description: "User already exists with this email.",
            variant: "destructive",
          })
        } else {
          const newUser = {
            id: Date.now().toString(),
            email,
            password,
            name: email.split("@")[0],
            createdAt: new Date().toISOString(),
          }
          users.push(newUser)
          localStorage.setItem("ai-tutor-users", JSON.stringify(users))
          localStorage.setItem("ai-tutor-user", JSON.stringify(newUser))

          toast({
            title: "Account created!",
            description: "Welcome to AI Personal Tutor.",
          })
          router.push("/dashboard")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Personal Tutor</h1>
          <p className="text-gray-600 mt-2">Your intelligent learning companion</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">AI Chat</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Reminders</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <User className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Profile</p>
            </div>
          </div>
        </div>

        {/* Login/Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
