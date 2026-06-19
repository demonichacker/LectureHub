'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  getCourses, 
  getMaterials, 
  getDepartments, 
  getLecturers,
  getActivityLogs,
  Faculty,
  Department,
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
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Lock, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck,
  TrendingUp,
  FilePlus,
  BookOpen,
  Info,
  Check,
  Search,
  Settings,
  Sun,
  Moon,
  ListRestart,
  Upload,
  X as XIcon,
  Users,
  Save
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  // Authentication State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authError, setAuthError] = useState('')

  // Dashboard Data State
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'courses' | 'lecturers' | 'logs'>('overview')

  // Form states for creating new entities
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    fileName: '',
    fileSize: '1.5 MB',
    courseId: '',
    description: '',
    contentMock: ''
  })
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      triggerNotification('Please select a valid PDF file.', 'error')
      return
    }
    const sizeKB = file.size / 1024
    const sizeStr = sizeKB >= 1024
      ? `${(sizeKB / 1024).toFixed(1)} MB`
      : `${Math.round(sizeKB)} KB`
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedFile({ name: file.name, size: sizeStr, dataUrl })
      setNewMaterial(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeStr,
        title: prev.title || file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
      }))
    }
    reader.readAsDataURL(file)
  }

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    description: '',
    departmentId: '',
    level: '100',
    semester: '1',
    lecturerId: ''
  })

  // Lecturer form state
  const [newLecturer, setNewLecturer] = useState({ name: '', email: '', departmentId: '' })
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)

  const [isCustomCourse, setIsCustomCourse] = useState(false)
  const [customCourseCode, setCustomCourseCode] = useState('')
  const [customCourseName, setCustomCourseName] = useState('')

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  // Auth persistence check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('cv_admin_auth')
      if (savedAuth === 'true') {
        setIsLoggedIn(true)
      }
    }
    // Load storage datasets
    refreshData()
  }, [])

  const refreshData = () => {
    setCourses(getCourses())
    setMaterials(getMaterials())
    setDepartments(getDepartments())
    setLecturers(getLecturers())
    setActivityLogs(getActivityLogs())
  }

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Handle Admin Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@coursevault.edu' && password === 'admin123') {
      setIsLoggedIn(true)
      setAuthError('')
      sessionStorage.setItem('cv_admin_auth', 'true')
      logActivity('Admin Login', 'Admin portal accessed successfully.')
      refreshData()
      triggerNotification('Welcome back, Administrator!')
    } else {
      setAuthError('Invalid credentials. Hint: admin@coursevault.edu / admin123')
    }
  }

  // Handle Admin Sign Out
  const handleSignOut = () => {
    setIsLoggedIn(false)
    sessionStorage.removeItem('cv_admin_auth')
    logActivity('Admin Logout', 'Admin logged out of the portal.')
  }

  // Material Actions
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.title || (!newMaterial.courseId && !isCustomCourse) || (isCustomCourse && !customCourseCode) || !newMaterial.fileName) {
      triggerNotification('Please select a PDF file and complete all required fields.', 'error')
      return
    }

    let finalCourseId = newMaterial.courseId

    if (isCustomCourse) {
      const existing = courses.find(c => c.code.trim().toLowerCase() === customCourseCode.trim().toLowerCase())
      if (existing) {
        finalCourseId = existing.id
      } else {
        // Create new course dynamically
        finalCourseId = `course-${Date.now()}`
        const courseItem: Course = {
          id: finalCourseId,
          code: customCourseCode.toUpperCase().trim(),
          name: customCourseName.trim() || customCourseCode.toUpperCase().trim(),
          description: 'Automatically registered during material upload.',
          departmentId: departments[0]?.id || 'csc',
          level: 300,
          semester: 1,
          lecturerId: lecturers[0]?.id || 'turing'
        }
        const currentCourses = getCourses()
        saveCourses([...currentCourses, courseItem])
        logActivity('Course Created', `Auto-registered course ${courseItem.code} during PDF upload.`)
      }
    }

    const materialItem: Material = {
      id: `mat-${Date.now()}`,
      title: newMaterial.title,
      fileName: newMaterial.fileName.endsWith('.pdf') ? newMaterial.fileName : `${newMaterial.fileName}.pdf`,
      fileSize: newMaterial.fileSize || '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      courseId: finalCourseId,
      description: newMaterial.description,
      contentMock: newMaterial.contentMock || `## ${newMaterial.title}\n\nThis document was uploaded from your device.`,
      fileData: uploadedFile?.dataUrl
    }

    const currentMaterials = getMaterials()
    const updated = [materialItem, ...currentMaterials]
    saveMaterials(updated)
    
    // Log Activity
    const finalCourses = getCourses()
    const targetCourse = finalCourses.find(c => c.id === finalCourseId)
    logActivity('Material Uploaded', `Admin added "${newMaterial.title}" to course ${targetCourse?.code || 'Unknown'}`)
    
    triggerNotification('PDF Lecture Note uploaded successfully!')
    
    // Reset Form
    setNewMaterial({
      title: '',
      fileName: '',
      fileSize: '1.5 MB',
      courseId: '',
      description: '',
      contentMock: ''
    })
    setUploadedFile(null)
    setCustomCourseCode('')
    setCustomCourseName('')
    setIsCustomCourse(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    
    refreshData()
  }

  const handleDeleteMaterial = (id: string) => {
    if (!confirm('Are you sure you want to delete this lecture material?')) return
    
    const currentMaterials = getMaterials()
    const target = currentMaterials.find(m => m.id === id)
    const updated = currentMaterials.filter(m => m.id !== id)
    saveMaterials(updated)
    
    logActivity('Material Deleted', `Admin deleted material: "${target?.title || 'Unknown'}"`)
    triggerNotification('Material deleted from database.')
    refreshData()
  }

  // Course Actions
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.code || !newCourse.name || !newCourse.departmentId || !newCourse.lecturerId) {
      triggerNotification('Please complete all course fields.', 'error')
      return
    }

    const courseItem: Course = {
      id: `course-${Date.now()}`,
      code: newCourse.code,
      name: newCourse.name,
      description: newCourse.description,
      departmentId: newCourse.departmentId,
      level: parseInt(newCourse.level),
      semester: parseInt(newCourse.semester),
      lecturerId: newCourse.lecturerId
    }

    const currentCourses = getCourses()
    const updated = [...currentCourses, courseItem]
    saveCourses(updated)
    
    logActivity('Course Created', `Admin registered new syllabus course ${newCourse.code}: ${newCourse.name}`)
    triggerNotification('New course added to syllabus!')
    
    setNewCourse({
      code: '',
      name: '',
      description: '',
      departmentId: '',
      level: '100',
      semester: '1',
      lecturerId: ''
    })
    
    refreshData()
  }

  const handleDeleteCourse = (id: string) => {
    if (!confirm('Warning: Deleting this course will also orphan its uploaded PDF files. Continue?')) return
    
    const currentCourses = getCourses()
    const target = currentCourses.find(c => c.id === id)
    const updated = currentCourses.filter(c => c.id !== id)
    saveCourses(updated)

    // Optionally cleanup orphaned materials
    const currentMaterials = getMaterials()
    const cleanedMaterials = currentMaterials.filter(m => m.courseId !== id)
    saveMaterials(cleanedMaterials)
    
    logActivity('Course Deleted', `Admin deleted syllabus course: ${target?.code || 'Unknown'}`)
    triggerNotification('Course and associated materials removed.')
    refreshData()
  }

  // Lecturer CRUD
  const handleAddLecturer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLecturer.name.trim()) {
      triggerNotification('Lecturer name is required.', 'error')
      return
    }
    const item: Lecturer = {
      id: `lec-${Date.now()}`,
      name: newLecturer.name.trim(),
      email: newLecturer.email.trim(),
      departmentId: newLecturer.departmentId || departments[0]?.id || 'csc'
    }
    saveLecturers([...getLecturers(), item])
    logActivity('Lecturer Added', `Admin registered lecturer: ${item.name}`)
    triggerNotification(`${item.name} added successfully!`)
    setNewLecturer({ name: '', email: '', departmentId: '' })
    refreshData()
  }

  const handleSaveEditLecturer = () => {
    if (!editingLecturer || !editingLecturer.name.trim()) {
      triggerNotification('Name cannot be empty.', 'error')
      return
    }
    const updated = getLecturers().map(l =>
      l.id === editingLecturer.id ? editingLecturer : l
    )
    saveLecturers(updated)
    logActivity('Lecturer Updated', `Admin updated lecturer: ${editingLecturer.name}`)
    triggerNotification('Lecturer details saved!')
    setEditingLecturer(null)
    refreshData()
  }

  const handleDeleteLecturer = (id: string) => {
    const target = getLecturers().find(l => l.id === id)
    if (!confirm(`Delete lecturer "${target?.name}"? Their courses will show TBA.`)) return
    saveLecturers(getLecturers().filter(l => l.id !== id))
    logActivity('Lecturer Deleted', `Admin removed lecturer: ${target?.name || 'Unknown'}`)
    triggerNotification('Lecturer removed from system.')
    refreshData()
  }

  // Check login state and render Sign In page if false
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[90vh] bg-muted/30 px-4 py-8">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">CourseVault Admin Portal</h2>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Secure Academic Gate
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Lecturer Login Credentials
            </p>
            <div className="pl-5 space-y-0.5 font-semibold">
              <p>Email: <code className="font-mono bg-background/60 px-1 py-0.5 rounded border">admin@coursevault.edu</code></p>
              <p>Password: <code className="font-mono bg-background/60 px-1 py-0.5 rounded border">admin123</code></p>
            </div>
          </div>

          {authError && (
            <div className="bg-destructive/10 text-destructive text-xs font-semibold p-3 rounded-lg border border-destructive/20">
              {authError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Administrative Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="admin@coursevault.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Secret Password</label>
                <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer">Recover Key</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md mt-6 flex justify-center items-center gap-2"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Authenticate Console
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground underline">
              Return to Student View
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/10 transition-colors">
      {/* Banner Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl animate-bounce text-xs font-semibold ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' 
            : 'bg-destructive/15 text-destructive border-destructive/20'
        }`}>
          {notification.type === 'success' ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          {notification.message}
        </div>
      )}

      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
            </Link>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                CourseVault Admin
              </span>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider leading-none">
                Authenticated Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg bg-background">
              Student View
            </Link>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 bg-muted hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Submenu */}
      <div className="bg-card border-b border-border px-4 py-2 transition-colors">
        <div className="max-w-7xl mx-auto flex gap-4 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'materials' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            PDF Materials ({materials.length})
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'courses' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Syllabus Courses ({courses.length})
          </button>
          <button 
            onClick={() => setActiveTab('lecturers')}
            className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lecturers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Lecturers ({lecturers.length})
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListRestart className="h-4 w-4" />
            System Logs
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <span className="block text-3xl font-bold font-mono text-primary">{materials.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total PDF Files</span>
              </div>
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <span className="block text-3xl font-bold font-mono text-primary">{courses.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Syllabus Courses</span>
              </div>
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <span className="block text-3xl font-bold font-mono text-primary">{lecturers.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registered Lecturers</span>
              </div>
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <span className="block text-3xl font-bold font-mono text-primary">
                  {materials.reduce((acc, m) => acc + m.downloadCount, 0)}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Simulated Downloads</span>
              </div>
            </div>

            {/* SVG Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Popular Downloads chart (Custom HTML / SVG) */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Download Volume by PDF Material</h3>
                </div>

                {materials.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {materials.slice(0, 5).map((material) => {
                      const maxVal = Math.max(...materials.map(m => m.downloadCount), 1)
                      const pct = Math.round((material.downloadCount / maxVal) * 100)

                      return (
                        <div key={material.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="truncate max-w-[250px] sm:max-w-md">{material.title}</span>
                            <span className="font-mono text-primary">{material.downloadCount} DLs</span>
                          </div>
                          <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No downloads data collected yet.</p>
                )}
              </div>

              {/* Action logs mini widget */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-bold text-sm uppercase tracking-wide">Activity Logs</h3>
                  <button onClick={() => setActiveTab('logs')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs space-y-0.5 pb-2 border-b border-border/30 last:border-0">
                      <div className="flex justify-between font-bold text-foreground/80">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-medium text-[11px] leading-tight">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload PDF Form */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <FilePlus className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Upload Academic PDF</h3>
              </div>

              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Week 3 - Systems Architecture"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Course</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCourse(!isCustomCourse)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      {isCustomCourse ? 'Choose Existing Course' : 'Create Custom Course'}
                    </button>
                  </div>

                  {isCustomCourse ? (
                    <div className="space-y-2 border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Course Code *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. PHY 301"
                            value={customCourseCode}
                            onChange={(e) => setCustomCourseCode(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-muted rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Course Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Modern Physics"
                            value={customCourseName}
                            onChange={(e) => setCustomCourseName(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-muted rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <select
                      required
                      value={newMaterial.courseId}
                      onChange={(e) => setNewMaterial({...newMaterial, courseId: e.target.value})}
                      className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="">Select Course...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Real file upload zone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PDF File from Device</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                  />

                  {uploadedFile ? (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <FileText className="h-4.5 w-4.5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">{uploadedFile.size} · PDF ready to upload</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null)
                          setNewMaterial(prev => ({ ...prev, fileName: '', fileSize: '1.5 MB' }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg shrink-0 transition-colors"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragOver(false)
                        const file = e.dataTransfer.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                      className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-all ${
                        isDragOver
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">Click or drag & drop PDF here</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Upload directly from your computer or device</p>
                      </div>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Abstract Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description summary..."
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 rounded-xl transition-all shadow"
                >
                  Upload & Register Material
                </button>
              </form>
            </div>

            {/* Materials List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-bold text-base tracking-tight">Active Repositories</h3>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border">
                  {materials.length} Total items
                </span>
              </div>

              {materials.length > 0 ? (
                <div className="space-y-3">
                  {materials.map((material) => {
                    const course = courses.find(c => c.id === material.courseId)
                    return (
                      <div 
                        key={material.id} 
                        className="bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm group hover:border-blue-500/20"
                      >
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                            {course ? course.code : 'UNMAPPED'}
                          </span>
                          <h4 className="font-bold text-sm truncate mt-1.5 text-card-foreground">
                            {material.title}
                          </h4>
                          <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                            {material.fileName} ({material.fileSize})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center px-2 py-1 hidden xs:block">
                            <span className="block text-xs font-bold font-mono">{material.downloadCount}</span>
                            <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">DLs</span>
                          </div>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="p-2 text-destructive hover:bg-destructive/15 rounded-lg transition-all"
                            title="Delete file"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-10 text-center">No lecture materials currently uploaded.</p>
              )}
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Course Form */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Add Course Catalog</h3>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSC 301"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                      className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operating Systems"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                      className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <select
                    required
                    value={newCourse.departmentId}
                    onChange={(e) => setNewCourse({...newCourse, departmentId: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Study Level</label>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                      className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none"
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semester</label>
                    <select
                      value={newCourse.semester}
                      onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                      className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none"
                    >
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lecturer in Charge</label>
                  <select
                    required
                    value={newCourse.lecturerId}
                    onChange={(e) => setNewCourse({...newCourse, lecturerId: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="">Select Lecturer...</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Syllabus Description</label>
                  <textarea
                    rows={3}
                    placeholder="Outline topics covered, course objective, prerequisites..."
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 rounded-xl transition-all shadow"
                >
                  Create Course Syllabus
                </button>
              </form>
            </div>

            {/* Courses List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-bold text-base tracking-tight">Active Curriculum Catalog</h3>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border">
                  {courses.length} registered
                </span>
              </div>

              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => {
                    const dept = departments.find(d => d.id === course.departmentId)
                    const lecturer = lecturers.find(l => l.id === course.lecturerId)
                    const fileCount = materials.filter(m => m.courseId === course.id).length

                    return (
                      <div 
                        key={course.id} 
                        className="bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm group hover:border-indigo-500/20"
                      >
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                            {course.code}
                          </span>
                          <h4 className="font-bold text-sm truncate mt-1.5 text-card-foreground">
                            {course.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide truncate mt-0.5">
                            Level {course.level} • Dept: {dept?.name || 'Unknown'} • Lecturer: {lecturer?.name || 'TBA'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center px-2 py-1 hidden xs:block">
                            <span className="block text-xs font-bold font-mono">{fileCount}</span>
                            <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">PDFs</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-destructive hover:bg-destructive/15 rounded-lg transition-all"
                            title="Delete course"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-10 text-center">No syllabus courses created.</p>
              )}
            </div>
          </div>
        )}

        {/* LECTURERS TAB */}
        {activeTab === 'lecturers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Lecturer Form */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Add New Lecturer</h3>
              </div>

              <form onSubmit={handleAddLecturer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. John Smith"
                    value={newLecturer.name}
                    onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. j.smith@univ.edu"
                    value={newLecturer.email}
                    onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <select
                    value={newLecturer.departmentId}
                    onChange={(e) => setNewLecturer({...newLecturer, departmentId: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 rounded-xl transition-all shadow flex items-center justify-center gap-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Lecturer
                </button>
              </form>
            </div>

            {/* Lecturers List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-bold text-base tracking-tight">Registered Lecturers</h3>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border">
                  {lecturers.length} total
                </span>
              </div>

              <div className="space-y-3">
                {lecturers.map((lecturer) => {
                  const dept = departments.find(d => d.id === lecturer.departmentId)
                  const isEditing = editingLecturer?.id === lecturer.id

                  return (
                    <div
                      key={lecturer.id}
                      className={`bg-card border rounded-xl p-4 shadow-sm transition-all ${
                        isEditing ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border hover:border-blue-500/20'
                      }`}
                    >
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Editing Lecturer</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                              <input
                                type="text"
                                value={editingLecturer.name}
                                onChange={(e) => setEditingLecturer({...editingLecturer, name: e.target.value})}
                                className="w-full px-2.5 py-1.5 text-xs bg-muted rounded-lg border border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                autoFocus
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                              <input
                                type="email"
                                value={editingLecturer.email}
                                onChange={(e) => setEditingLecturer({...editingLecturer, email: e.target.value})}
                                className="w-full px-2.5 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                            <select
                              value={editingLecturer.departmentId}
                              onChange={(e) => setEditingLecturer({...editingLecturer, departmentId: e.target.value})}
                              className="w-full px-2.5 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSaveEditLecturer}
                              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all"
                            >
                              <Save className="h-3.5 w-3.5" />
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingLecturer(null)}
                              className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-muted/80 border border-border transition-all"
                            >
                              <XIcon className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {lecturer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-card-foreground truncate">{lecturer.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium truncate">
                                {lecturer.email || 'No email set'} · {dept?.name || 'Unknown Dept'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setEditingLecturer(lecturer)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                              title="Edit lecturer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                              className="p-2 text-destructive hover:bg-destructive/15 rounded-lg transition-all"
                              title="Delete lecturer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {lecturers.length === 0 && (
                  <p className="text-xs text-muted-foreground py-10 text-center">No lecturers registered yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-sm uppercase tracking-wide">Curriculum & Access Logs</h3>
              <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border">
                Showing last {activityLogs.length} actions
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="text-xs sm:text-sm p-3 bg-muted/40 border border-border/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-4 font-bold text-foreground">
                    <span className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-md border border-primary/10">
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium text-xs leading-relaxed pl-1 pt-0.5">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-sm text-muted-foreground">
              CourseVault © 2026 Academic Portal
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Library Explorer</Link>
            <span className="hover:text-foreground cursor-pointer">Help Center</span>
            <span className="hover:text-foreground cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
