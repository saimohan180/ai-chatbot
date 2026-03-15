"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  BookOpen,
  GraduationCap,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as const,
    category: "homework" as const,
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem("ai-tutor-reminders")
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  const saveReminders = (updatedReminders: Reminder[]) => {
    setReminders(updatedReminders)
    localStorage.setItem("ai-tutor-reminders", JSON.stringify(updatedReminders))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const reminderData: Reminder = {
      id: editingReminder?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      category: formData.category,
      completed: editingReminder?.completed || false,
      createdAt: editingReminder?.createdAt || new Date().toISOString(),
    }

    let updatedReminders: Reminder[]
    if (editingReminder) {
      updatedReminders = reminders.map((r) => (r.id === editingReminder.id ? reminderData : r))
      toast({
        title: "Success",
        description: "Reminder updated successfully!",
      })
    } else {
      updatedReminders = [...reminders, reminderData]
      toast({
        title: "Success",
        description: "Reminder created successfully!",
      })
    }

    saveReminders(updatedReminders)
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: "homework",
    })
    setEditingReminder(null)
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      priority: reminder.priority,
      category: reminder.category,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedReminders = reminders.filter((r) => r.id !== id)
    saveReminders(updatedReminders)
    toast({
      title: "Success",
      description: "Reminder deleted successfully!",
    })
  }

  const toggleComplete = (id: string) => {
    const updatedReminders = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    saveReminders(updatedReminders)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "homework":
        return <FileText className="h-4 w-4" />
      case "exam":
        return <GraduationCap className="h-4 w-4" />
      case "study":
        return <BookOpen className="h-4 w-4" />
      case "project":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const sortedReminders = reminders.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const upcomingReminders = reminders.filter((r) => !r.completed && new Date(r.dueDate) >= new Date()).length
  const overdueReminders = reminders.filter(
    (r) => !r.completed && new Date(r.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)),
  ).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard")} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5 dark:text-gray-300" />
              </Button>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-xl shadow-lg shadow-green-500/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Study Reminders</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your tasks and deadlines</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={resetForm} 
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Reminder</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">
                      {editingReminder ? "Edit Reminder" : "Create New Reminder"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="dark:text-gray-300">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Math homework due"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Additional details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setFormData({ ...formData, priority: value })
                          }
                        >
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: "homework" | "exam" | "study" | "project" | "other") =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectItem value="homework">Homework</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="study">Study Session</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {editingReminder ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{upcomingReminders}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                    <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueReminders}</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reminders List */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Your Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedReminders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-block mb-4">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No reminders yet. Create your first one!</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                        reminder.completed 
                          ? "bg-gray-50 dark:bg-gray-700/50 opacity-75 border-gray-200 dark:border-gray-600" 
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <button
                            onClick={() => toggleComplete(reminder.id)}
                            className={`mt-1 p-1.5 rounded-full transition-all ${
                              reminder.completed 
                                ? "bg-green-600 text-white shadow-sm" 
                                : "border-2 border-gray-300 dark:border-gray-500 hover:border-green-500 dark:hover:border-green-400"
                            }`}
                            aria-label={reminder.completed ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {reminder.completed && <CheckCircle className="h-4 w-4" />}
                            {!reminder.completed && <div className="h-4 w-4" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <span className="text-gray-500 dark:text-gray-400">
                                {getCategoryIcon(reminder.category)}
                              </span>
                              <h3
                                className={`font-medium ${
                                  reminder.completed 
                                    ? "line-through text-gray-500 dark:text-gray-400" 
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {reminder.title}
                              </h3>
                              <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                            </div>
                            {reminder.description && (
                              <p className={`text-sm mb-2 ${
                                reminder.completed 
                                  ? "text-gray-400 dark:text-gray-500" 
                                  : "text-gray-600 dark:text-gray-300"
                              }`}>
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(reminder.dueDate).toLocaleDateString()}{" "}
                                  {new Date(reminder.dueDate).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </span>
                              <Badge variant="outline" className="capitalize dark:border-gray-500">
                                {reminder.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(reminder)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(reminder.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
