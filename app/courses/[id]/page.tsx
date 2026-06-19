'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  getCourses, 
  getMaterials, 
  getDepartments, 
  getLecturers,
  Course,
  Material,
  Department,
  Lecturer,
  downloadMaterialFile
} from '@/lib/storage'
import { useTheme } from '@/components/theme-provider'
import PDFPreviewer from '@/components/pdf-previewer'
import { 
  ArrowLeft,
  GraduationCap, 
  BookOpen, 
  User, 
  Mail, 
  Calendar, 
  HardDrive,
  Download, 
  Eye,
  FileText,
  Sun,
  Moon,
  Clock,
  ExternalLink
} from 'lucide-react'

export default function CourseDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [course, setCourse] = useState<Course | null>(null)
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [lecturer, setLecturer] = useState<Lecturer | null>(null)

  // PDF Preview state
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    const allCourses = getCourses()
    const foundCourse = allCourses.find(c => c.id === id)
    
    if (!foundCourse) {
      // Course not found, redirect to explorer
      router.push('/')
      return
    }

    setCourse(foundCourse)

    // Load materials for this course
    const allMaterials = getMaterials()
    setCourseMaterials(allMaterials.filter(m => m.courseId === foundCourse.id))

    // Load department
    const allDepts = getDepartments()
    setDepartment(allDepts.find(d => d.id === foundCourse.departmentId) || null)

    // Load lecturer
    const allLecturers = getLecturers()
    setLecturer(allLecturers.find(l => l.id === foundCourse.lecturerId) || null)
  }, [id, router])

  const handleDownload = (material: Material) => {
    downloadMaterialFile(material)
    // Update local state to reflect new download count
    const allMaterials = getMaterials()
    setCourseMaterials(allMaterials.filter(m => m.courseId === course?.id))
  }

  const triggerPreview = (material: Material) => {
    setPreviewMaterial(material)
    setIsPreviewOpen(true)
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground font-semibold">Loading course repository...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
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
            <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">
              Library Explorer
            </Link>
            <Link href="/admin" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">
              Admin Portal
            </Link>

            <button 
              onClick={toggleTheme} 
              className="p-2 bg-muted hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Course Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 shadow-inner relative overflow-hidden">
        {/* Abstract shapes in background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#fff_0,transparent_40%)]"></div>
        <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/4 opacity-10">
          <BookOpen className="h-[300px] w-[300px]" />
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Course Syllabus
              </span>
              <span className="bg-blue-400/30 text-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {course.semester === 1 ? '1st Semester' : '2nd Semester'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {course.code} - {course.name}
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl font-medium">
              Department of {department?.name || 'Academic Studies'} • Study Level: {course.level}
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 active:scale-95 transition-all text-sm shrink-0 shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explorer
          </Link>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Info & Instructor Panel */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Instructor Details</h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800/40">
                {lecturer ? lecturer.name.split(' ').pop()?.charAt(0) : 'L'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-base text-foreground truncate">{lecturer?.name || 'Lecturer'}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Course Instructor</p>
              </div>
            </div>

            {lecturer?.email && (
              <div className="pt-3 border-t border-border flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate hover:text-foreground cursor-pointer">{lecturer.email}</span>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Syllabus Overview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              {course.description || 'No detailed syllabus outline provided. Please contact the instructor for physical guidelines and assessment information.'}
            </p>
          </div>
        </div>

        {/* Materials Table/List (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Vault Lecture Files</h2>
            </div>
            <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border border-border">
              {courseMaterials.length} PDFs
            </span>
          </div>

          {courseMaterials.length > 0 ? (
            <div className="space-y-4">
              {courseMaterials.map((material) => (
                <div 
                  key={material.id}
                  className="bg-card border border-border hover:border-primary/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm group"
                >
                  <div className="min-w-0 flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate" title={material.title}>
                        {material.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold truncate mt-0.5" title={material.fileName}>
                        {material.fileName}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                          {material.fileSize}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Uploaded {material.uploadDate}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-primary font-bold">{material.downloadCount} downloads</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                    <button 
                      onClick={() => triggerPreview(material)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button 
                      onClick={() => handleDownload(material)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <Clock className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-bold text-lg">No Materials Uploaded Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                The lecturer has not uploaded any study slides, notes, or syllabi outlines to CourseVault for this course yet.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* PDF Previewer */}
      {previewMaterial && (
        <PDFPreviewer
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setPreviewMaterial(null)
          }}
          material={previewMaterial}
          courseCode={course.code}
          lecturerName={lecturer?.name}
        />
      )}

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
            <Link href="/admin" className="hover:text-foreground text-blue-600 dark:text-blue-400 font-bold">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
