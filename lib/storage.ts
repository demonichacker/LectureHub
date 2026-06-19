// CourseVault Local Storage Database Utility

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
  { id: 'sci', name: 'Faculty of Science', code: 'SCI' },
  { id: 'eng', name: 'Faculty of Engineering', code: 'ENG' },
  { id: 'soc', name: 'Faculty of Social Sciences', code: 'SOC' },
]

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'csc', name: 'Computer Science', facultyId: 'sci' },
  { id: 'mth', name: 'Mathematics', facultyId: 'sci' },
  { id: 'eee', name: 'Electrical Engineering', facultyId: 'eng' },
  { id: 'eco', name: 'Economics', facultyId: 'soc' },
]

const INITIAL_LECTURERS: Lecturer[] = [
  { id: 'turing', name: 'Dr. Alan Turing', email: 'a.turing@univ.edu', departmentId: 'csc' },
  { id: 'lovelace', name: 'Prof. Ada Lovelace', email: 'a.lovelace@univ.edu', departmentId: 'csc' },
  { id: 'gauss', name: 'Dr. Carl Gauss', email: 'c.gauss@univ.edu', departmentId: 'mth' },
  { id: 'tesla', name: 'Prof. Nikola Tesla', email: 'n.tesla@univ.edu', departmentId: 'eee' },
  { id: 'keynes', name: 'Dr. John Keynes', email: 'j.keynes@univ.edu', departmentId: 'eco' },
]

const INITIAL_COURSES: Course[] = [
  {
    id: 'csc-301',
    code: 'CSC 301',
    name: 'Introduction to Computer Programming',
    description: 'Learn the fundamental concepts of programming including variables, control structures, functions, and arrays using Python.',
    departmentId: 'csc',
    level: 300,
    semester: 1,
    lecturerId: 'turing',
  },
  {
    id: 'csc-302',
    code: 'CSC 302',
    name: 'Data Structures and Algorithms',
    description: 'A study of memory models, stacks, queues, linked lists, binary search trees, sorting, searching, and algorithmic complexity.',
    departmentId: 'csc',
    level: 300,
    semester: 2,
    lecturerId: 'lovelace',
  },
  {
    id: 'mth-301',
    code: 'MTH 301',
    name: 'Calculus I',
    description: 'Limits, continuity, derivatives of algebraic and trigonometric functions, applications of derivatives, integration, and area.',
    departmentId: 'mth',
    level: 300,
    semester: 1,
    lecturerId: 'gauss',
  },
  {
    id: 'mth-302',
    code: 'MTH 302',
    name: 'Linear Algebra',
    description: 'Systems of linear equations, matrices, determinants, vector spaces, linear transformations, eigenvalues, and eigenvectors.',
    departmentId: 'mth',
    level: 300,
    semester: 1,
    lecturerId: 'gauss',
  },
  {
    id: 'eee-301',
    code: 'EEE 301',
    name: 'Basic Circuit Theory',
    description: 'Circuit elements, Ohm\'s law, Kirchhoff\'s laws, network theorems, transient analysis of RL, RC, and RLC circuits.',
    departmentId: 'eee',
    level: 300,
    semester: 1,
    lecturerId: 'tesla',
  },
  {
    id: 'eco-301',
    code: 'ECO 301',
    name: 'Principles of Economics',
    description: 'Microeconomics and macroeconomics concepts including supply and demand, market structures, GDP, inflation, and fiscal policies.',
    departmentId: 'eco',
    level: 300,
    semester: 1,
    lecturerId: 'keynes',
  },
]

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    title: 'CSC 301 Lecture Notes - Python Syntax and Data Types',
    fileName: 'csc301_week1_python_intro.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-06-01',
    downloadCount: 142,
    courseId: 'csc-301',
    description: 'Week 1 introduction slide notes. Details variable declarations, numeric types, strings, and standard output methods in Python.',
    contentMock: '## Lecture 1: Python Introduction\n\n- Python is a high-level, interpreted programming language.\n- Known for readability and clean syntax.\n- Created by Guido van Rossum, released in 1991.\n\n### Basic Syntax\n\n```python\n# This is a comment\nname = "Student"\nprint("Hello, " + name)\n```\n\n### Primitive Types\n- Integer: `x = 10`\n- Float: `y = 10.5`\n- String: `z = "University"`\n- Boolean: `is_active = True`',
  },
  {
    id: 'mat-2',
    title: 'CSC 301 Lab Guide - Working with Loops and Functions',
    fileName: 'csc301_lab_guide_loops.pdf',
    fileSize: '840 KB',
    uploadDate: '2026-06-08',
    downloadCount: 98,
    courseId: 'csc-301',
    description: 'Hands-on laboratory manual containing exercises for nested loops, while loops, function definitions, and parameters.',
    contentMock: '## Week 2 Lab: Loops and Functions\n\n### Objective\nUnderstand iteration structures and code modularization.\n\n### For Loops\n```python\nfor i in range(5):\n    print("Iteration:", i)\n```\n\n### Functions\n```python\ndef greet(user):\n    return f"Welcome, {user}!"\n\nprint(greet("Ada"))\n```\n\n### Exercises\n1. Write a program to display the Fibonacci sequence up to N terms.\n2. Create a function that determines if a number is prime.',
  },
  {
    id: 'mat-3',
    title: 'CSC 302 - Binary Search Trees & AVL Trees Guide',
    fileName: 'csc302_binary_search_trees.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-06-12',
    downloadCount: 215,
    courseId: 'csc-302',
    description: 'In-depth guide on tree nodes, BST operations (insertion, deletion, search) and self-balancing AVL trees with rotations.',
    contentMock: '## Binary Search Trees (BST)\n\nA binary search tree is a tree-based data structure where each node has at most two children, and for any node, left subtree elements are smaller, right subtree elements are larger.\n\n### Time Complexity\n- Search: O(log n) average, O(n) worst case.\n- Insertion: O(log n) average.\n- Deletion: O(log n) average.\n\n### AVL Trees\nSelf-balancing binary search trees where the difference in heights of left and right subtrees (balance factor) cannot exceed 1. Supports single and double rotations (LL, RR, LR, RL) to restore balance.',
  },
  {
    id: 'mat-4',
    title: 'MTH 301 Limit Theorems & Proofs',
    fileName: 'mth301_limit_theorems.pdf',
    fileSize: '1.5 MB',
    uploadDate: '2026-06-02',
    downloadCount: 310,
    courseId: 'mth-301',
    description: 'Formal mathematical proofs and examples of limit rules including squeeze theorem, L\'Hopital\'s rule, and infinite limits.',
    contentMock: '## Limits & Continuity\n\n### Definition of Limit\nLet f(x) be a function defined on an open interval containing c. We say the limit of f(x) as x approaches c is L if for every ε > 0 there exists a δ > 0 such that |f(x) - L| < ε whenever 0 < |x - c| < δ.\n\n### Limit Laws\n1. Sum Law: lim (f(x) + g(x)) = lim f(x) + lim g(x)\n2. Squeeze Theorem: If f(x) <= g(x) <= h(x) and lim f(x) = lim h(x) = L, then lim g(x) = L.\n3. L\'Hopital\'s Rule: Used for indeterminate forms (0/0 or inf/inf). Take derivatives of numerator and denominator.',
  },
  {
    id: 'mat-5',
    title: 'MTH 302 Matrix Operations and Echelon Forms',
    fileName: 'mth302_matrices_echelon.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-06-11',
    downloadCount: 87,
    courseId: 'mth-302',
    description: 'Matrix computations, Row-Reduced Echelon Form (RREF), Gauss-Jordan elimination, and systems of linear equations solutions.',
    contentMock: '## Linear Systems & Matrices\n\n### System of Equations\nAn m x n system of equations can be represented as AX = B.\n\n### Row-Reduced Echelon Form (RREF)\nRules:\n1. All non-zero rows are above any zero rows.\n2. The leading coefficient of a non-zero row is always strictly to the right of the leading coefficient of the row above it.\n3. Leading coefficients are 1.\n4. Columns containing a leading 1 have zeros elsewhere.\n\n### Gauss-Jordan Elimination\nApply elementary row operations to reduce the augmented matrix [A|B] to [I|X], yielding the system solutions.',
  },
  {
    id: 'mat-6',
    title: 'EEE 301 Kirchhoff\'s Voltage and Current Laws Notes',
    fileName: 'eee301_kcl_kvl.pdf',
    fileSize: '950 KB',
    uploadDate: '2026-06-05',
    downloadCount: 165,
    courseId: 'eee-301',
    description: 'Detailed circuits study notes detailing KCL, KVL, nodal and mesh analysis equations with practice diagrams.',
    contentMock: '## Kirchhoff\'s Circuit Laws\n\n### Kirchhoff\'s Current Law (KCL)\n- The algebraic sum of currents entering a node (or a closed boundary) is zero.\n- Based on the law of conservation of charge.\n- Σ I_in = Σ I_out\n\n### Kirchhoff\'s Voltage Law (KVL)\n- The algebraic sum of all voltages around any closed loop in a circuit is zero.\n- Based on the law of conservation of energy.\n- Σ V = 0\n\n### Node Voltage Method\n1. Select a reference node (ground).\n2. Assign voltages to non-reference nodes.\n3. Apply KCL to each non-reference node.',
  },
]

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', action: 'System Initialized', details: 'Preloaded default CourseVault academic database.', timestamp: '2026-06-18T12:00:00.000Z' },
  { id: 'log-2', action: 'Material Uploaded', details: 'Added CSC 202 - Binary Search Trees & AVL Trees Guide.', timestamp: '2026-06-18T14:30:00.000Z' },
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

export const getFaculties = (): Faculty[] => getStorageItem('cv_faculties', INITIAL_FACULTIES)
export const getDepartments = (): Department[] => getStorageItem('cv_departments', INITIAL_DEPARTMENTS)
export const getLecturers = (): Lecturer[] => getStorageItem('cv_lecturers', INITIAL_LECTURERS)

export const getCourses = (): Course[] => {
  const courses = getStorageItem('cv_courses', INITIAL_COURSES)
  // Auto-upgrade old stored courses to 300 Level
  if (courses.some(c => c.level !== 300)) {
    saveCourses(INITIAL_COURSES)
    saveMaterials(INITIAL_MATERIALS)
    return INITIAL_COURSES
  }
  return courses
}

export const getMaterials = (): Material[] => getStorageItem('cv_materials', INITIAL_MATERIALS)
export const getActivityLogs = (): ActivityLog[] => getStorageItem('cv_logs', INITIAL_LOGS)

export const saveFaculties = (data: Faculty[]) => setStorageItem('cv_faculties', data)
export const saveDepartments = (data: Department[]) => setStorageItem('cv_departments', data)
export const saveLecturers = (data: Lecturer[]) => setStorageItem('cv_lecturers', data)
export const saveCourses = (data: Course[]) => setStorageItem('cv_courses', data)
export const saveMaterials = (data: Material[]) => setStorageItem('cv_materials', data)
export const saveActivityLogs = (data: ActivityLog[]) => setStorageItem('cv_logs', data)

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
(CourseVault Digital eLibrary) Tj
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
(Thank you for using CourseVault. Keep learning!) Tj
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
