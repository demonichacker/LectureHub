// LectureHub Local Storage Database Utility

export interface Faculty {
  id: string
  name: string
  code: string
}

export interface Department {
  id: string
  name: string
  facultyId: string
}

export interface Lecturer {
  id: string
  name: string
  email: string
  departmentId: string
  avatar?: string
}

export interface Course {
  id: string
  code: string
  name: string
  description: string
  departmentId: string
  level: number // 100, 200, 300, 400
  semester: number // 1 or 2
  lecturerId: string
}

export interface Material {
  id: string
  title: string
  fileName: string
  fileSize: string
  uploadDate: string
  downloadCount: number
  courseId: string
  description?: string
  contentMock?: string // simulated text slides/pages for previewer
  fileData?: string   // base64 data URL of real uploaded PDF file
}

export interface ActivityLog {
  id: string
  action: string
  details: string
  timestamp: string
}

export interface DownloadStats {
  courseCode: string
  downloads: number
}

// Initial Mock Data
const INITIAL_FACULTIES: Faculty[] = [
  { id: 'part1', name: 'Fundamentals', code: 'FUND' },
  { id: 'part2', name: 'Advanced Topics', code: 'ADV' },
  { id: 'part3', name: 'Practical Applications', code: 'PRAC' },
]

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'intro', name: 'Introduction', facultyId: 'part1' },
  { id: 'core', name: 'Core Concepts', facultyId: 'part1' },
  { id: 'specialized', name: 'Specialized Topics', facultyId: 'part2' },
  { id: 'projects', name: 'Projects & Assignments', facultyId: 'part3' },
]

const INITIAL_LECTURERS: Lecturer[] = [
  { id: 'instructor', name: 'Instructor', email: 'instructor@lecture.edu', departmentId: 'intro' },
  { id: 'mentor', name: 'Teaching Assistant', email: 'ta@lecture.edu', departmentId: 'core' },
]

const INITIAL_COURSES: Course[] = [
  {
    id: 'lec-101',
    code: 'LEC 101',
    name: 'Week 1 - Introduction & Fundamentals',
    description: 'First week covering core concepts and basics.',
    departmentId: 'intro',
    level: 100,
    semester: 1,
    lecturerId: 'instructor',
  },
  {
    id: 'lec-102',
    code: 'LEC 102',
    name: 'Week 2 - Building on Basics',
    description: 'Second week developing foundational knowledge further.',
    departmentId: 'intro',
    level: 100,
    semester: 1,
    lecturerId: 'instructor',
  },
  {
    id: 'lec-201',
    code: 'LEC 201',
    name: 'Week 3 - Core Concepts Deep Dive',
    description: 'Comprehensive exploration of core subject matter.',
    departmentId: 'core',
    level: 200,
    semester: 1,
    lecturerId: 'mentor',
  },
  {
    id: 'lec-202',
    code: 'LEC 202',
    name: 'Week 4 - Advanced Techniques',
    description: 'Building expertise with advanced methodologies.',
    departmentId: 'core',
    level: 200,
    semester: 2,
    lecturerId: 'mentor',
  },
  {
    id: 'lec-301',
    code: 'LEC 301',
    name: 'Specialized Topic - Part A',
    description: 'In-depth exploration of specialized topics.',
    departmentId: 'specialized',
    level: 300,
    semester: 1,
    lecturerId: 'instructor',
  },
  {
    id: 'lec-302',
    code: 'LEC 302',
    name: 'Specialized Topic - Part B',
    description: 'Continued specialized study and applications.',
    departmentId: 'specialized',
    level: 300,
    semester: 2,
    lecturerId: 'instructor',
  },
]

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    title: 'Week 1 - Lecture Notes',
    fileName: 'week1_notes.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-06-01',
    downloadCount: 142,
    courseId: 'lec-101',
    description: 'Comprehensive lecture notes for Week 1 covering introduction and fundamentals.',
    contentMock: '# Week 1: Introduction & Fundamentals\n\n## Topic Overview\n- Core concepts and definitions\n- Essential terminology\n- Historical context\n\n## Key Points\n1. Introduction to subject matter\n2. Foundational principles\n3. Basic applications\n\n## Review Questions\n- What are the main concepts covered?\n- How do these principles apply?\n- Can you provide real-world examples?',
  },
  {
    id: 'mat-2',
    title: 'Week 1 - Practice Problems & Solutions',
    fileName: 'week1_problems.pdf',
    fileSize: '840 KB',
    uploadDate: '2026-06-02',
    downloadCount: 98,
    courseId: 'lec-101',
    description: 'Practice problems with detailed solutions for Week 1 material.',
    contentMock: '# Week 1: Practice Problems\n\n## Problem Set 1\n\n### Problem 1\nDefine and explain the main concept.\nSolution: [Detailed explanation]\n\n### Problem 2\nProvide a real-world application.\nSolution: [Example with explanation]\n\n### Problem 3\nCompare and contrast key ideas.\nSolution: [Comparative analysis]',
  },
  {
    id: 'mat-3',
    title: 'Week 2 - Lecture Slides',
    fileName: 'week2_slides.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-06-08',
    downloadCount: 215,
    courseId: 'lec-102',
    description: 'Slide presentation for Week 2 lectures.',
    contentMock: '# Week 2: Building on Basics\n\n## Slide 1: Review\n- Quick recap of Week 1\n- Connection to new material\n\n## Slide 2: New Concepts\n- Expanding understanding\n- Deeper exploration\n\n## Slide 3: Applications\n- Practical examples\n- Industry use cases',
  },
  {
    id: 'mat-4',
    title: 'Week 3 - Core Concepts Handout',
    fileName: 'week3_handout.pdf',
    fileSize: '1.5 MB',
    uploadDate: '2026-06-12',
    downloadCount: 310,
    courseId: 'lec-201',
    description: 'Detailed handout covering core concepts in depth.',
    contentMock: '# Week 3: Core Concepts Deep Dive\n\n## Section 1: Foundations\n- Building blocks of the subject\n- Interconnected concepts\n\n## Section 2: Theory\n- Theoretical frameworks\n- Mathematical foundations\n\n## Section 3: Practice\n- Worked examples\n- Step-by-step solutions',
  },
  {
    id: 'mat-5',
    title: 'Week 4 - Advanced Techniques Guide',
    fileName: 'week4_techniques.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-06-14',
    downloadCount: 87,
    courseId: 'lec-202',
    description: 'Comprehensive guide to advanced techniques and methodologies.',
    contentMock: '# Week 4: Advanced Techniques\n\n## Technique 1: Method Overview\n- When to use\n- Step-by-step procedure\n- Example implementation\n\n## Technique 2: Optimization\n- Efficiency considerations\n- Best practices\n- Common pitfalls\n\n## Technique 3: Troubleshooting\n- Problem-solving strategies\n- Case studies',
  },
  {
    id: 'mat-6',
    title: 'Specialized Topics - Part A Notes',
    fileName: 'special_part_a.pdf',
    fileSize: '950 KB',
    uploadDate: '2026-06-16',
    downloadCount: 165,
    courseId: 'lec-301',
    description: 'In-depth notes on specialized topics Part A.',
    contentMock: '# Specialized Topics: Part A\n\n## Introduction to Specialization\n- Why this topic matters\n- Real-world applications\n\n## Deep Dive\n- Advanced concepts\n- Complex scenarios\n- Expert insights\n\n## Summary\n- Key takeaways\n- Connection to Part B',
  },
]

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', action: 'System Initialized', details: 'LectureHub initialized with default lecture database.', timestamp: '2026-06-18T12:00:00.000Z' },
  { id: 'log-2', action: 'Material Uploaded', details: 'Added Week 1 lecture materials.', timestamp: '2026-06-18T14:30:00.000Z' },
]

// LocalStorage helpers (safe for SSR)
const isClient = typeof window !== 'undefined'

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!isClient) return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading localStorage key:', key, error)
    return defaultValue
  }
}

const setStorageItem = <T>(key: string, value: T): void => {
  if (!isClient) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error writing localStorage key:', key, error)
  }
}

export const getFaculties = (): Faculty[] => getStorageItem('lh_faculties', INITIAL_FACULTIES)
export const getDepartments = (): Department[] => getStorageItem('lh_departments', INITIAL_DEPARTMENTS)
export const getLecturers = (): Lecturer[] => getStorageItem('lh_lecturers', INITIAL_LECTURERS)

export const getCourses = (): Course[] => {
  const courses = getStorageItem('lh_courses', INITIAL_COURSES)
  return courses
}

export const getMaterials = (): Material[] => getStorageItem('lh_materials', INITIAL_MATERIALS)
export const getActivityLogs = (): ActivityLog[] => getStorageItem('lh_logs', INITIAL_LOGS)

export const saveFaculties = (data: Faculty[]) => setStorageItem('lh_faculties', data)
export const saveDepartments = (data: Department[]) => setStorageItem('lh_departments', data)
export const saveLecturers = (data: Lecturer[]) => setStorageItem('lh_lecturers', data)
export const saveCourses = (data: Course[]) => setStorageItem('lh_courses', data)
export const saveMaterials = (data: Material[]) => setStorageItem('lh_materials', data)
export const saveActivityLogs = (data: ActivityLog[]) => setStorageItem('lh_logs', data)

// Add activity log utility
export const logActivity = (action: string, details: string) => {
  const logs = getActivityLogs()
  const newLog: ActivityLog = {
    id: `log-${Date.now()}`,
    action,
    details,
    timestamp: new Date().toISOString(),
  }
  saveActivityLogs([newLog, ...logs].slice(0, 50)) // keep last 50
}

// Download PDF trigger
export const downloadMaterialFile = (material: Material) => {
  // Update download count
  const materials = getMaterials()
  const updated = materials.map((m) => {
    if (m.id === material.id) {
      return { ...m, downloadCount: m.downloadCount + 1 }
    }
    return m
  })
  saveMaterials(updated)

  // Log activity
  logActivity('Material Downloaded', `Downloaded "${material.title}" (${material.fileName})`)

  // If a real uploaded PDF file exists, download it directly
  if (material.fileData) {
    const link = document.createElement('a')
    link.href = material.fileData
    link.download = material.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }

  // Dynamically build and download a valid PDF Blob
  const course = getCourses().find(c => c.id === material.courseId)
  const codeStr = course ? course.code : 'GENERIC'
  
  const pdfStructure = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 18 Tf
50 720 Td
(LectureHub Materials Library) Tj
/F1 12 Tf
0 -30 Td
(Document Title: ${material.title}) Tj
0 -20 Td
(Course Code: ${codeStr}) Tj
0 -20 Td
(Filename: ${material.fileName}) Tj
0 -20 Td
(Date Downloaded: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(Thank you for using LectureHub. Keep learning!) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000216 00000 n 
0000000283 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
533
%%EOF`

  const blob = new Blob([pdfStructure], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = material.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
