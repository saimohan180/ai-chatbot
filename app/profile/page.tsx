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
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyConfig {
  id: string
  label: string
  provider: string
  apiKey: string
  model?: string
  baseUrl?: string
  isActive: boolean
}

const MAX_API_KEYS = 10

const PROVIDERS = [
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { value: "google", label: "Google AI", placeholder: "AIza..." },
  { value: "groq", label: "Groq", placeholder: "gsk_..." },
  { value: "mistral", label: "Mistral", placeholder: "..." },
  { value: "together", label: "Together AI", placeholder: "..." },
  { value: "perplexity", label: "Perplexity", placeholder: "pplx-..." },
  { value: "deepseek", label: "DeepSeek", placeholder: "..." },
  { value: "azure", label: "Azure OpenAI", placeholder: "..." },
  { value: "custom", label: "Custom (OpenAI-compatible)", placeholder: "..." },
]

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
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([])
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [newKeyForm, setNewKeyForm] = useState({
    label: "",
    provider: "openai",
    apiKey: "",
    model: "",
    baseUrl: "",
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

      // Load API keys
      const savedKeys = localStorage.getItem(`ai-tutor-api-keys-${user.id}`)
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys))
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

  const saveApiKeys = (keys: ApiKeyConfig[]) => {
    if (!profile) return
    setApiKeys(keys)
    localStorage.setItem(`ai-tutor-api-keys-${profile.id}`, JSON.stringify(keys))
  }

  const handleAddApiKey = () => {
    if (!newKeyForm.label.trim() || !newKeyForm.apiKey.trim() || !newKeyForm.provider) {
      toast({ title: "Missing fields", description: "Label, provider, and API key are required.", variant: "destructive" })
      return
    }
    if (apiKeys.length >= MAX_API_KEYS) {
      toast({ title: "Limit reached", description: `You can add at most ${MAX_API_KEYS} API keys.`, variant: "destructive" })
      return
    }

    const newKey: ApiKeyConfig = {
      id: Date.now().toString(),
      label: newKeyForm.label.trim(),
      provider: newKeyForm.provider,
      apiKey: newKeyForm.apiKey.trim(),
      model: newKeyForm.model.trim() || undefined,
      baseUrl: newKeyForm.baseUrl.trim() || undefined,
      isActive: apiKeys.length === 0, // first key becomes active by default
    }

    saveApiKeys([...apiKeys, newKey])
    setNewKeyForm({ label: "", provider: "openai", apiKey: "", model: "", baseUrl: "" })
    setShowApiKeyForm(false)
    toast({ title: "API key added", description: `"${newKey.label}" has been saved.` })
  }

  const handleDeleteApiKey = (id: string) => {
    const updated = apiKeys.filter((k) => k.id !== id)
    // If we deleted the active key, activate the first remaining one
    if (!updated.some((k) => k.isActive) && updated.length > 0) {
      updated[0].isActive = true
    }
    saveApiKeys(updated)
    toast({ title: "API key removed" })
  }

  const handleSetActiveKey = (id: string) => {
    const updated = apiKeys.map((k) => ({ ...k, isActive: k.id === id }))
    saveApiKeys(updated)
    toast({ title: "Active API key updated" })
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••"
    return key.slice(0, 4) + "••••••••" + key.slice(-4)
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="apikeys" className="flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  API Keys
                </TabsTrigger>
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

              {/* API Keys Tab */}
              <TabsContent value="apikeys" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Key className="h-5 w-5" />
                        <span>API Keys</span>
                        <Badge variant="secondary" className="ml-2">
                          {apiKeys.length}/{MAX_API_KEYS}
                        </Badge>
                      </CardTitle>
                      {apiKeys.length < MAX_API_KEYS && (
                        <Button
                          size="sm"
                          onClick={() => setShowApiKeyForm((v) => !v)}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Key</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Add up to {MAX_API_KEYS} provider API keys. Your keys are stored locally in your browser and sent
                      directly to the AI provider — they are never stored on any server.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Key Form */}
                    {showApiKeyForm && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                        <h3 className="font-medium text-blue-900">New API Key</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="key-label">Label</Label>
                            <Input
                              id="key-label"
                              placeholder="e.g. My OpenAI Key"
                              value={newKeyForm.label}
                              onChange={(e) => setNewKeyForm({ ...newKeyForm, label: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="key-provider">Provider</Label>
                            <Select
                              value={newKeyForm.provider}
                              onValueChange={(v) => setNewKeyForm({ ...newKeyForm, provider: v })}
                            >
                              <SelectTrigger id="key-provider">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PROVIDERS.map((p) => (
                                  <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="key-value">API Key</Label>
                          <Input
                            id="key-value"
                            type="password"
                            placeholder={PROVIDERS.find((p) => p.value === newKeyForm.provider)?.placeholder || "..."}
                            value={newKeyForm.apiKey}
                            onChange={(e) => setNewKeyForm({ ...newKeyForm, apiKey: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="key-model">
                              Model <span className="text-gray-400 text-xs">(optional)</span>
                            </Label>
                            <Input
                              id="key-model"
                              placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022"
                              value={newKeyForm.model}
                              onChange={(e) => setNewKeyForm({ ...newKeyForm, model: e.target.value })}
                            />
                          </div>
                          {(newKeyForm.provider === "azure" || newKeyForm.provider === "custom") && (
                            <div className="space-y-1">
                              <Label htmlFor="key-baseurl">Base URL</Label>
                              <Input
                                id="key-baseurl"
                                placeholder="https://..."
                                value={newKeyForm.baseUrl}
                                onChange={(e) => setNewKeyForm({ ...newKeyForm, baseUrl: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <Button size="sm" onClick={handleAddApiKey}>
                            <Save className="h-4 w-4 mr-1" />
                            Save Key
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => {
                              setShowApiKeyForm(false)
                              setNewKeyForm({ label: "", provider: "openai", apiKey: "", model: "", baseUrl: "" })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Key List */}
                    {apiKeys.length === 0 && !showApiKeyForm ? (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No API keys configured yet.</p>
                        <p className="text-xs mt-1">Click "Add Key" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {apiKeys.map((key) => {
                          const providerLabel = PROVIDERS.find((p) => p.value === key.provider)?.label || key.provider
                          const isVisible = visibleKeys.has(key.id)
                          return (
                            <div
                              key={key.id}
                              className={`rounded-lg border p-3 flex items-start justify-between gap-3 ${
                                key.isActive ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm truncate">{key.label}</span>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {providerLabel}
                                  </Badge>
                                  {key.isActive && (
                                    <Badge className="text-xs bg-green-600 shrink-0">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <code className="text-xs text-gray-600 font-mono">
                                    {isVisible ? key.apiKey : maskKey(key.apiKey)}
                                  </code>
                                  <button
                                    onClick={() => toggleKeyVisibility(key.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label={isVisible ? "Hide key" : "Show key"}
                                  >
                                    {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </div>
                                {key.model && (
                                  <p className="text-xs text-gray-500 mt-1">Model: {key.model}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 shrink-0">
                                {!key.isActive && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs bg-transparent"
                                    onClick={() => handleSetActiveKey(key.id)}
                                  >
                                    Use
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteApiKey(key.id)}
                                  aria-label="Delete key"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
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
