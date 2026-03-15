"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  User,
  ArrowLeft,
  Edit,
  Save,
  BookOpen,
  Trophy,
  MessageCircle,
  Bell,
  Palette,
  Shield,
  BarChart3,
  Zap,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string
  grade: string
  subjects: string[]
  studyGoal: string
  avatar?: string
  createdAt?: string
  preferences: {
    notifications: boolean
    darkMode: boolean
    studyReminders: boolean
    weeklyReports: boolean
  }
  stats: {
    totalSessions: number
    totalQuestions: number
    completedTasks: number
    studyStreak: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    grade: "",
    subjects: [] as string[],
    studyGoal: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Load user profile
    const userData = localStorage.getItem("ai-tutor-user")
    if (userData) {
      const user = JSON.parse(userData)

      // Get or create extended profile
      const savedProfile = localStorage.getItem(`ai-tutor-profile-${user.id}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          bio: "",
          grade: "",
          subjects: [],
          studyGoal: "",
          createdAt: user.createdAt || new Date().toISOString(),
          preferences: {
            notifications: true,
            darkMode: false,
            studyReminders: true,
            weeklyReports: false,
          },
          stats: {
            totalSessions: Math.floor(Math.random() * 20) + 5,
            totalQuestions: Math.floor(Math.random() * 100) + 25,
            completedTasks: Math.floor(Math.random() * 15) + 3,
            studyStreak: Math.floor(Math.random() * 7) + 1,
          },
        }
        setProfile(defaultProfile)
        localStorage.setItem(`ai-tutor-profile-${user.id}`, JSON.stringify(defaultProfile))
      }
    }
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        bio: profile.bio,
        grade: profile.grade,
        subjects: profile.subjects,
        studyGoal: profile.studyGoal,
      })
    }
  }, [profile])

  const handleSaveProfile = () => {
    if (!profile) return

    const updatedProfile = {
      ...profile,
      name: formData.name,
      bio: formData.bio,
      grade: formData.grade,
      subjects: formData.subjects,
      studyGoal: formData.studyGoal,
    }

    setProfile(updatedProfile)
    localStorage.setItem(`ai-tutor-profile-${profile.id}`, JSON.stringify(updatedProfile))

    // Update main user data
    const userData = { ...JSON.parse(localStorage.getItem("ai-tutor-user") || "{}"), name: formData.name }
    localStorage.setItem("ai-tutor-user", JSON.stringify(userData))

    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully!",
    })
  }

  const handlePreferenceChange = (key: keyof UserProfile["preferences"], value: boolean) => {
    if (!profile) return

    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    }

    setProfile(updatedProfile)
    localStorage.setItem(`ai-tutor-profile-${profile.id}`, JSON.stringify(updatedProfile))
  }

  const handleSubjectToggle = (subject: string) => {
    const updatedSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter((s) => s !== subject)
      : [...formData.subjects, subject]

    setFormData({ ...formData, subjects: updatedSubjects })
  }

  const availableSubjects = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
  ]

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                className={`flex items-center space-x-2 ${
                  isEditing 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                } shadow-lg`}
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Profile</TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Statistics</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Settings</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Card */}
                  <Card className="lg:col-span-1 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <Avatar className="h-24 w-24 ring-4 ring-blue-100 dark:ring-blue-900">
                          <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                            {profile.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-xl dark:text-white">{profile.name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                      <div className="flex justify-center mt-3">
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <Zap className="h-3 w-3" />
                          <span>{profile.stats.studyStreak} day streak</span>
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Profile Details */}
                  <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade" className="dark:text-gray-300">Grade/Level</Label>
                          <Select
                            value={formData.grade}
                            onValueChange={(value) => setFormData({ ...formData, grade: value })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                              <SelectItem value="elementary">Elementary</SelectItem>
                              <SelectItem value="middle">Middle School</SelectItem>
                              <SelectItem value="high">High School</SelectItem>
                              <SelectItem value="college">College</SelectItem>
                              <SelectItem value="graduate">Graduate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="dark:text-gray-300">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studyGoal" className="dark:text-gray-300">Study Goal</Label>
                        <Input
                          id="studyGoal"
                          placeholder="e.g., Improve math grades, prepare for SAT..."
                          value={formData.studyGoal}
                          onChange={(e) => setFormData({ ...formData, studyGoal: e.target.value })}
                          disabled={!isEditing}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="dark:text-gray-300">Subjects of Interest</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableSubjects.map((subject) => (
                            <Badge
                              key={subject}
                              variant={formData.subjects.includes(subject) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                !isEditing ? "pointer-events-none" : "hover:scale-105"
                              } ${
                                formData.subjects.includes(subject) 
                                  ? "bg-blue-600 hover:bg-blue-700" 
                                  : "dark:border-gray-500 dark:text-gray-300"
                              }`}
                              onClick={() => isEditing && handleSubjectToggle(subject)}
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="stats" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Sessions</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{profile.stats.totalSessions}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Asked</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{profile.stats.totalQuestions}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                          <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{profile.stats.completedTasks}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                          <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</p>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{profile.stats.studyStreak} days</p>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                          <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <BarChart3 className="h-5 w-5" />
                      <span>Learning Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium dark:text-gray-300">Overall Progress</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {formData.subjects.slice(0, 3).map((subject, index) => {
                        const progress = [85, 70, 60][index] || 50
                        const colors = [
                          "from-green-500 to-emerald-500",
                          "from-purple-500 to-pink-500",
                          "from-orange-500 to-red-500"
                        ]
                        return (
                          <div key={subject} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium dark:text-gray-300">{subject}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${colors[index] || "from-blue-500 to-cyan-500"} h-2 rounded-full transition-all duration-500`} 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium dark:text-white">Push Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications about your studies</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications}
                        onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium dark:text-white">Study Reminders</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded about upcoming tasks</p>
                      </div>
                      <Switch
                        checked={profile.preferences.studyReminders}
                        onCheckedChange={(checked) => handlePreferenceChange("studyReminders", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium dark:text-white">Weekly Reports</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={profile.preferences.weeklyReports}
                        onCheckedChange={(checked) => handlePreferenceChange("weeklyReports", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Palette className="h-5 w-5" />
                      <span>Appearance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium dark:text-white">Theme</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Use the toggle in the header to switch themes</p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Shield className="h-5 w-5" />
                      <span>Account</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-medium mb-1 dark:text-white">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-medium mb-1 dark:text-white">Account Created</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : !isNaN(parseInt(profile.id)) && parseInt(profile.id) > 1000000000000
                            ? new Date(parseInt(profile.id)).toLocaleDateString()
                            : "Unknown"
                        }
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
