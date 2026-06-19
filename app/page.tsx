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
  Search, 
  Download, 
  Eye,
  Sun, 
  Moon, 
  FileText,
  X,
  ChevronDown
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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal Previewer State
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    setCourses(getCourses())
    setMaterials(getMaterials())
    setFaculties(getFaculties())
    setDepartments(getDepartments())
    setLecturers(getLecturers())
  }, [])

  // Get all unique tags from courses
  const allTags = Array.from(new Set(courses.map(c => c.code)))

  // Filter materials based on search and tags
  const filteredMaterials = materials.filter(material => {
    const course = courses.find(c => c.id === material.courseId)
    const matchesSearch = searchQuery === '' || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      (course && selectedTags.includes(course.code))
    
    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleDownload = (material: Material) => {
    downloadMaterialFile(material)
    setMaterials(getMaterials())
  }

  const triggerPreview = (material: Material) => {
    setPreviewMaterial(material)
    setIsPreviewOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Top Bar */}
      <nav className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm tracking-tight">LectureHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              Admin
            </Link>
            <button 
              onClick={toggleTheme} 
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tighter mb-3">
            Materials Library
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-lg">
            Explore and download course materials, lecture notes, and study resources.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mb-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            Filter by Course
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-border">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Active Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedTags.map(tag => (
                <div 
                  key={tag}
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid gap-5">
            {filteredMaterials.map((material) => {
              const course = courses.find(c => c.id === material.courseId)
              const lecturer = course ? lecturers.find(l => l.id === course.lecturerId) : null

              return (
                <div
                  key={material.id}
                  className="group bg-card border border-border hover:border-primary/50 rounded-lg p-6 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block text-xs font-bold font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                          {course?.code || 'UNKNOWN'}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {material.fileSize}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {material.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>Instructor: <span className="font-semibold text-foreground">{lecturer?.name || 'TBA'}</span></div>
                        <div>Downloads: <span className="font-semibold text-foreground">{material.downloadCount}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => triggerPreview(material)}
                        className="p-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(material)}
                        className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">No materials found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-muted-foreground">
          <p>LectureHub © 2026</p>
        </div>
      </footer>

      {/* PDF Previewer */}
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
