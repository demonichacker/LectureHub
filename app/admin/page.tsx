'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  getCourses, 
  getMaterials, 
  getLecturers,
  getActivityLogs,
  Course,
  Material,
  Lecturer,
  ActivityLog,
  saveCourses,
  saveMaterials,
  saveLecturers,
  logActivity
} from '@/lib/storage'
import { useTheme } from '@/components/theme-provider'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Upload,
  Sun, 
  Moon,
  LogOut,
  Lock,
  Mail,
  Info,
  Check,
  Settings,
  Activity
} from 'lucide-react'

export default function AdminPanel() {
  const { theme, toggleTheme } = useTheme()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  
  const [activeTab, setActiveTab] = useState<'materials' | 'courses' | 'lecturers' | 'logs'>('materials')
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  const [newMaterial, setNewMaterial] = useState({ title: '', fileName: '', fileSize: '1.5 MB', courseId: '', description: '' })
  const [newCourse, setNewCourse] = useState({ code: '', name: '', description: '', lecturerId: '' })
  const [newLecturer, setNewLecturer] = useState({ name: '', email: '' })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string, dataUrl: string} | null>(null)

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('lh_admin_auth')
    if (savedAuth === 'true') {
      setIsLoggedIn(true)
      refreshData()
    }
  }, [])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@eduvault.edu' && password === 'admin123') {
      setIsLoggedIn(true)
      setAuthError('')
      sessionStorage.setItem('lh_admin_auth', 'true')
      logActivity('Admin Login', 'Admin console accessed')
      refreshData()
      showNotification('Welcome back!')
    } else {
      setAuthError('Invalid credentials')
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    sessionStorage.removeItem('lh_admin_auth')
  }

  const refreshData = () => {
    setCourses(getCourses())
    setMaterials(getMaterials())
    setLecturers(getLecturers())
    setLogs(getActivityLogs())
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      showNotification('Please select a PDF file', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(1) + ' MB', dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedFile || !newMaterial.title || !newMaterial.courseId) {
      showNotification('Complete all fields and upload a PDF', 'error')
      return
    }

    const material: Material = {
      id: `mat-${Date.now()}`,
      title: newMaterial.title,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      courseId: newMaterial.courseId,
      description: newMaterial.description,
      fileData: uploadedFile.dataUrl
    }

    saveMaterials([material, ...getMaterials()])
    logActivity('Material Uploaded', `Added "${newMaterial.title}"`)
    showNotification('Material uploaded!')
    setNewMaterial({ title: '', fileName: '', fileSize: '1.5 MB', courseId: '', description: '' })
    setUploadedFile(null)
    refreshData()
  }

  const handleDeleteMaterial = (id: string) => {
    if (!confirm('Delete this material?')) return
    saveMaterials(getMaterials().filter(m => m.id !== id))
    logActivity('Material Deleted', 'Material removed')
    showNotification('Material deleted')
    refreshData()
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.code || !newCourse.name) {
      showNotification('Course code and name required', 'error')
      return
    }

    const course: Course = {
      id: `course-${Date.now()}`,
      code: newCourse.code,
      name: newCourse.name,
      description: newCourse.description,
      departmentId: 'intro',
      level: 100,
      semester: 1,
      lecturerId: newCourse.lecturerId || lecturers[0]?.id || 'instructor'
    }

    saveCourses([...getCourses(), course])
    logActivity('Course Added', `Added ${newCourse.code}`)
    showNotification('Course added!')
    setNewCourse({ code: '', name: '', description: '', lecturerId: '' })
    refreshData()
  }

  const handleDeleteCourse = (id: string) => {
    if (!confirm('Delete this course?')) return
    saveCourses(getCourses().filter(c => c.id !== id))
    saveMaterials(getMaterials().filter(m => m.courseId !== id))
    logActivity('Course Deleted', 'Course removed')
    showNotification('Course deleted')
    refreshData()
  }

  const handleAddLecturer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLecturer.name) {
      showNotification('Lecturer name required', 'error')
      return
    }

    const lecturer: Lecturer = {
      id: `lec-${Date.now()}`,
      name: newLecturer.name,
      email: newLecturer.email,
      departmentId: 'intro'
    }

    saveLecturers([...getLecturers(), lecturer])
    logActivity('Lecturer Added', `Added ${newLecturer.name}`)
    showNotification('Lecturer added!')
    setNewLecturer({ name: '', email: '' })
    refreshData()
  }

  const handleDeleteLecturer = (id: string) => {
    if (!confirm('Delete this lecturer?')) return
    saveLecturers(getLecturers().filter(l => l.id !== id))
    logActivity('Lecturer Deleted', 'Lecturer removed')
    showNotification('Lecturer deleted')
    refreshData()
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <Lock className="h-8 w-8 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage your educational materials</p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-xs space-y-2">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Email: <code className="bg-background px-1 py-0.5 rounded">admin@eduvault.edu</code></p>
            <p>Password: <code className="bg-background px-1 py-0.5 rounded">admin123</code></p>
          </div>

          {authError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3 rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="admin@eduvault.edu"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1 rounded hover:bg-muted">
              View Library
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-1.5 hover:bg-muted rounded-lg"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button 
              onClick={handleSignOut}
              className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1 rounded flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          {notification.type === 'success' ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {(['materials', 'courses', 'lecturers', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Upload Material</h2>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Material Title</label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g., Week 1 Lecture Notes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Course</label>
                    <select
                      value={newMaterial.courseId}
                      onChange={(e) => setNewMaterial({...newMaterial, courseId: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description (Optional)</label>
                    <input
                      type="text"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Notes..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Upload PDF</label>
                  <label className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-all text-center text-sm text-muted-foreground">
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Check className="h-4 w-4 text-emerald-600" />
                        {uploadedFile.name}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        <Upload className="h-4 w-4" />
                        Click to select PDF
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Upload Material
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Uploaded Materials ({materials.length})</h2>
              <div className="space-y-2">
                {materials.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{m.title}</h3>
                      <p className="text-xs text-muted-foreground">{m.fileName} • {m.fileSize}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Add Course</h2>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Course Code</label>
                    <input
                      type="text"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="LEC 101"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Course Name</label>
                    <input
                      type="text"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Course Title"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
                  <input
                    type="text"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Course description"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Add Course
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Courses ({courses.length})</h2>
              <div className="space-y-2">
                {courses.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                    <div>
                      <h3 className="font-semibold text-sm">{c.code}</h3>
                      <p className="text-xs text-muted-foreground">{c.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lecturers Tab */}
        {activeTab === 'lecturers' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Add Lecturer</h2>
              <form onSubmit={handleAddLecturer} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={newLecturer.name}
                    onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={newLecturer.email}
                    onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="name@example.edu"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Add Lecturer
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Lecturers ({lecturers.length})</h2>
              <div className="space-y-2">
                {lecturers.map(l => (
                  <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                    <div>
                      <h3 className="font-semibold text-sm">{l.name}</h3>
                      <p className="text-xs text-muted-foreground">{l.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLecturer(l.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Activity Logs ({logs.length})</h2>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
                  <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{log.action}</h3>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
