'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getCourses, 
  getMaterials, 
  getFaculties, 
  getDepartments, 
  getLecturers,
  Faculty,
  Department,
  Course,
  Material,
  Lecturer,
  downloadMaterialFile
} from '@/lib/storage'
import { useTheme } from '@/components/theme-provider'
import PDFPreviewer from '@/components/pdf-previewer'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  GraduationCap, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Sun, 
  Moon, 
  ShieldAlert,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  
  // Modal Previewer State
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    // Load from storage
    setCourses(getCourses())
    setMaterials(getMaterials())
    setFaculties(getFaculties())
    setDepartments(getDepartments())
    setLecturers(getLecturers())
  }, [])

  // Dynamic lists dependent on selection
  const filteredDepartments = selectedFaculty 
    ? departments.filter(d => d.facultyId === selectedFaculty)
    : departments

  // Core Search & Filter Logic
  const filteredCourses = courses.filter(course => {
    // Search query matching (course code, name, description)
    const matchesSearch = searchQuery === '' || 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filters
    const matchesFaculty = !selectedFaculty || (() => {
      const dept = departments.find(d => d.id === course.departmentId)
      return dept?.facultyId === selectedFaculty
    })()
    
    const matchesDepartment = !selectedDepartment || course.departmentId === selectedDepartment
    const matchesLevel = !selectedLevel || course.level.toString() === selectedLevel
    const matchesSemester = !selectedSemester || course.semester.toString() === selectedSemester

    return matchesSearch && matchesFaculty && matchesDepartment && matchesLevel && matchesSemester
  })

  // Materials matching search query or selected filters
  const filteredMaterials = materials.filter(material => {
    const course = courses.find(c => c.id === material.courseId)
    const lecturer = course ? lecturers.find(l => l.id === course.lecturerId) : null
    
    const matchesSearch = searchQuery === '' || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course && course.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lecturer && lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilters = (!selectedFaculty || (() => {
      const dept = course ? departments.find(d => d.id === course.departmentId) : null
      return dept?.facultyId === selectedFaculty
    })()) &&
      (!selectedDepartment || (course && course.departmentId === selectedDepartment)) &&
      (!selectedLevel || (course && course.level.toString() === selectedLevel)) &&
      (!selectedSemester || (course && course.semester.toString() === selectedSemester))

    return matchesSearch && matchesFilters
  })

  // Popular and Recent items sorting
  const popularMaterials = [...materials]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 4)

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 4)

  // Clear filters helper
  const handleClearFilters = () => {
    setSelectedFaculty('')
    setSelectedDepartment('')
    setSelectedLevel('')
    setSelectedSemester('')
    setSearchQuery('')
  }

  // Get statistics
  const totalPDFs = materials.length
  const totalDownloads = materials.reduce((acc, m) => acc + m.downloadCount, 0)
  const totalCoursesCount = courses.length

  const triggerPreview = (material: Material) => {
    setPreviewMaterial(material)
    setIsPreviewOpen(true)
  }

  const handleDownload = (material: Material) => {
    downloadMaterialFile(material)
    // Refresh local numbers
    setMaterials(getMaterials())
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                CourseVault
              </span>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                Academic Library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                Library Explorer
              </Link>
              <Link href="/admin" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
                Admin Panel
              </Link>
            </nav>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 bg-muted hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 py-12 border-b border-border">
        <div className="max-w-4xl mx-auto text-center px-4">
          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            University Student Repository
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-4 mb-3">
            Access Lecture Notes & Academic Handouts
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search, filter, view and download lecture slides, outlines, lab guides, and past exams uploaded directly by your course instructors.
          </p>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-center border-r border-border">
              <span className="block text-2xl font-bold font-mono text-primary">{totalPDFs}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PDF Materials</span>
            </div>
            <div className="text-center border-r border-border">
              <span className="block text-2xl font-bold font-mono text-primary">{totalCoursesCount}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Courses</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold font-mono text-primary">{totalDownloads}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Downloads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                <h2 className="font-bold text-sm uppercase tracking-wide">Filter Repository</h2>
              </div>
              {(selectedFaculty || selectedDepartment || selectedLevel || selectedSemester || searchQuery) && (
                <button 
                  onClick={handleClearFilters}
                  className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Global Search Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Title, course code, lecturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Faculty Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faculty</label>
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value)
                  setSelectedDepartment('') // reset dependent department
                }}
                className="w-full px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              >
                <option value="">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              >
                <option value="">All Departments</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Level Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Study Level</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[100, 200, 300, 400].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(selectedLevel === lvl.toString() ? '' : lvl.toString())}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedLevel === lvl.toString()
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semester</label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(selectedSemester === sem.toString() ? '' : sem.toString())}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedSemester === sem.toString()
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border'
                    }`}
                  >
                    {sem === 1 ? '1st Sem' : '2nd Sem'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <section className="flex-1 space-y-8 min-w-0">
          
          {/* Available Lecture Materials Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Available Lecture Notes & Handouts</h2>
              <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-md border border-border">
                {filteredMaterials.length} materials found
              </span>
            </div>

            {filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMaterials.map((material) => {
                  const course = courses.find(c => c.id === material.courseId)
                  const lecturer = course ? lecturers.find(l => l.id === course.lecturerId) : null

                  return (
                    <div 
                      key={material.id}
                      className="group bg-card border border-border hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-900/10 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold font-mono bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            {course ? course.code : 'GENERIC'}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {material.fileSize} • {course ? `${course.semester === 1 ? '1st' : '2nd'} Sem` : ''}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-1" title={material.title}>
                          {material.title}
                        </h3>
                        {material.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                            {material.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <span className="font-bold text-[9px] uppercase tracking-wider">Instructor:</span>
                            <span className="text-foreground">{lecturer?.name || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <span className="font-bold text-[9px] uppercase tracking-wider">Filename:</span>
                            <span className="font-mono text-foreground/80 truncate max-w-[200px]">{material.fileName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 mt-2 flex items-center justify-between gap-3 text-xs">
                        <div className="text-left">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground leading-none">Downloads</p>
                          <p className="font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{material.downloadCount}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => triggerPreview(material)}
                            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-semibold px-3 py-2 rounded-xl transition-all"
                            title="Preview Material"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button 
                            onClick={() => handleDownload(material)}
                            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-3.5 py-2 rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                <ShieldAlert className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="font-bold text-lg">No materials match your search</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Try adjusting your keywords or selecting different department and level filters.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </section>
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
            <span className="hover:text-foreground cursor-pointer">Student Regulations</span>
            <span className="hover:text-foreground cursor-pointer">Help Center</span>
            <span className="hover:text-foreground cursor-pointer">Terms & Services</span>
            <Link href="/admin" className="hover:text-foreground text-blue-600 dark:text-blue-400 font-bold">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Custom PDF Previewer Overlay */}
      {previewMaterial && (
        <PDFPreviewer
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setPreviewMaterial(null)
          }}
          material={previewMaterial}
          courseCode={courses.find(c => c.id === previewMaterial.courseId)?.code}
          lecturerName={
            (() => {
              const course = courses.find(c => c.id === previewMaterial.courseId)
              const lecturer = course ? lecturers.find(l => l.id === course.lecturerId) : null
              return lecturer?.name
            })()
          }
        />
      )}
    </div>
  )
}

