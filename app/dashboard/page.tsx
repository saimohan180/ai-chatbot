"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Send, 
  Calendar, 
  User, 
  LogOut, 
  MessageCircle, 
  BookOpen, 
  Clock, 
  Lightbulb,
  Trash2,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface Reminder {
  id: string
  title: string
  description: string
  dueDate: string
  priority: "low" | "medium" | "high"
  category: "homework" | "exam" | "study" | "project" | "other"
  completed: boolean
  createdAt: string
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI Personal Tutor. I'm here to help you learn and answer any questions you have. What would you like to study today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ai-tutor-user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const chatHistory = localStorage.getItem("ai-tutor-chat")
    if (chatHistory) {
      const parsedMessages = JSON.parse(chatHistory).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(parsedMessages)
    }

    const savedReminders = localStorage.getItem("ai-tutor-reminders")
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      // Create AI message placeholder
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        sender: "ai",
        timestamp: new Date(),
      }

      let currentMessages = [...updatedMessages, aiMessage]
      setMessages(currentMessages)

      // Stream the response
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })

          currentMessages = currentMessages.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, content: msg.content + chunk } : msg,
          )
          setMessages([...currentMessages])
        }
      }

      // Save final messages to localStorage
      localStorage.setItem("ai-tutor-chat", JSON.stringify(currentMessages))
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Fallback to error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      localStorage.setItem("ai-tutor-chat", JSON.stringify(finalMessages))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("ai-tutor-user")
    localStorage.removeItem("ai-tutor-chat")
    router.push("/")
  }

  const handleClearChat = () => {
    const initialMessage: Message = {
      id: "1",
      content:
        "Hello! I'm your AI Personal Tutor. I'm here to help you learn and answer any questions you have. What would you like to study today?",
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages([initialMessage])
    localStorage.removeItem("ai-tutor-chat")
    toast({
      title: "Chat cleared",
      description: "Your conversation history has been cleared.",
    })
  }

  const { toast } = useToast()

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const upcomingReminders = reminders
    .filter((r) => !r.completed && new Date(r.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  const overdueCount = reminders.filter(
    (r) => !r.completed && new Date(r.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)),
  ).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Personal Tutor</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name || "Student"}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="flex items-center space-x-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-900 dark:text-white">Quick Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300"
                      onClick={() => setInputMessage("Help me with math homework")}
                    >
                      <BookOpen className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Math Help
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300"
                      onClick={() => setInputMessage("Explain a science concept")}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      Science
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300"
                      onClick={() => setInputMessage("Help with essay writing")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Writing
                    </Button>
                  </CardContent>
                </Card>
                {messages.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-gray-600"
                    onClick={handleClearChat}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat History
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="reminders" className="mt-4">
                <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between text-gray-900 dark:text-white">
                      Upcoming Tasks
                      {overdueCount > 0 && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          {overdueCount} overdue
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingReminders.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming tasks. Great job!</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingReminders.map((reminder) => (
                          <div 
                            key={reminder.id} 
                            className="text-xs p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:shadow-sm transition-shadow"
                          >
                            <p className="font-medium text-gray-900 dark:text-white truncate">{reminder.title}</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(reminder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => router.push("/reminders")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Tasks
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-900 dark:text-white">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-white">Name:</strong> {user?.name}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        <strong className="text-gray-900 dark:text-white">Email:</strong> {user?.email}
                      </p>
                      <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Active Student
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => router.push("/profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-3xl ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarFallback
                          className={message.sender === "user" 
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" 
                            : "bg-gradient-to-br from-green-600 to-emerald-600 text-white"}
                        >
                          {message.sender === "user" ? (user?.name?.charAt(0)?.toUpperCase() || "U") : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start space-x-3 max-w-3xl">
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Ask me anything about your studies..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 h-12 text-base border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputMessage.trim()} 
                    className="px-6 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to send, 
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono ml-1">Shift+Enter</kbd> for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
