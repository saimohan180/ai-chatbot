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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="bg-purple-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account and preferences</p>
              </div>
            </div>
            <Button
              onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
              className="flex items-center space-x-2"
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Card */}
                  <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-2xl bg-blue-600 text-white">
                            {profile.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                      <div className="flex justify-center mt-2">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{profile.stats.studyStreak} day streak</span>
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Profile Details */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade/Level</Label>
                          <Select
                            value={formData.grade}
                            onValueChange={(value) => setFormData({ ...formData, grade: value })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studyGoal">Study Goal</Label>
                        <Input
                          id="studyGoal"
                          placeholder="e.g., Improve math grades, prepare for SAT..."
                          value={formData.studyGoal}
                          onChange={(e) => setFormData({ ...formData, studyGoal: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subjects of Interest</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableSubjects.map((subject) => (
                            <Badge
                              key={subject}
                              variant={formData.subjects.includes(subject) ? "default" : "outline"}
                              className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
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
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Study Sessions</p>
                          <p className="text-2xl font-bold text-blue-600">{profile.stats.totalSessions}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Questions Asked</p>
                          <p className="text-2xl font-bold text-green-600">{profile.stats.totalQuestions}</p>
                        </div>
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                          <p className="text-2xl font-bold text-purple-600">{profile.stats.completedTasks}</p>
                        </div>
                        <Trophy className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Study Streak</p>
                          <p className="text-2xl font-bold text-orange-600">{profile.stats.studyStreak} days</p>
                        </div>
                        <Zap className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Learning Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {formData.subjects.slice(0, 3).map((subject, index) => {
                        const progress = [85, 70, 60][index] || 50
                        return (
                          <div key={subject} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{subject}</span>
                              <span className="text-sm text-gray-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications about your studies</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications}
                        onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Study Reminders</p>
                        <p className="text-sm text-gray-500">Get reminded about upcoming tasks</p>
                      </div>
                      <Switch
                        checked={profile.preferences.studyReminders}
                        onCheckedChange={(checked) => handlePreferenceChange("studyReminders", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-gray-500">Receive weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={profile.preferences.weeklyReports}
                        onCheckedChange={(checked) => handlePreferenceChange("weeklyReports", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Appearance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-gray-500">Switch to dark theme</p>
                      </div>
                      <Switch
                        checked={profile.preferences.darkMode}
                        onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Account</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Email</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Account Created</p>
                      <p className="text-sm text-gray-600">{new Date(profile.id).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
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
