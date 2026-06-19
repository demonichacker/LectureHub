# CourseVault 📚

A responsive, modern digital library platform for managing and accessing academic course materials. CourseVault provides universities and educational institutions with a centralized repository for lecture notes, handouts, past questions, and course materials organized by faculty, department, and academic level.

## ✨ Features

### 📖 Content Management
- **Organized Repository**: Browse materials by Faculty → Department → Course hierarchy
- **Multi-level Organization**: Support for academic levels (100, 200, 300, 400) and semesters
- **PDF Preview**: Built-in PDF viewer for instant material previewing without downloads
- **Material Tracking**: Track downloads and view material metadata (file size, upload date, lecturer info)

### 🔍 Search & Discovery
- **Advanced Search**: Search across course titles, codes, and materials
- **Smart Filters**: Filter by:
  - Faculty and Department
  - Academic Level
  - Semester
  - Lecturer
  - Course Code

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern UI built with shadcn/ui components
- **Fast Performance**: Optimized with Next.js for lightning-fast page loads

### 🔐 Admin Dashboard
- **Content Management**: Add, edit, and delete courses and materials
- **User Management**: Manage lecturers, departments, and faculties
- **Activity Logging**: Track all uploads and modifications with timestamps
- **Download Statistics**: Monitor material popularity and usage patterns

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 19, Next.js 16.2, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Lucide Icons |
| **State Management** | React Hooks, Local Storage |
| **PDF Handling** | PDF.js (via pdf-previewer component) |
| **Build Tools** | Tailwind CSS, PostCSS |
| **Package Manager** | pnpm |
| **Analytics** | Vercel Analytics |

## 📋 Project Structure

```
course-vault/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Main homepage with course browser
│   ├── globals.css             # Global styles
│   ├── admin/
│   │   └── page.tsx            # Admin dashboard
│   └── courses/
│       └── [id]/
│           └── page.tsx        # Individual course detail page
├── components/
│   ├── pdf-previewer.tsx       # PDF file viewer component
│   ├── theme-provider.tsx      # Dark/light theme context
│   └── ui/
│       └── button.tsx          # Reusable button component
├── lib/
│   ├── storage.ts              # Local storage database utilities & interfaces
│   └── utils.ts                # Utility functions
├── public/                      # Static assets and icons
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── next.config.mjs             # Next.js configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/demonichacker/vault.git
   cd vault
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint code quality checks |

## 💾 Data Structure

### Core Entities

**Faculty**
```typescript
{
  id: string
  name: string
  code: string
}
```

**Department**
```typescript
{
  id: string
  name: string
  facultyId: string
}
```

**Lecturer**
```typescript
{
  id: string
  name: string
  email: string
  departmentId: string
  avatar?: string
}
```

**Course**
```typescript
{
  id: string
  code: string
  name: string
  description: string
  departmentId: string
  level: number        // 100, 200, 300, 400
  semester: number     // 1 or 2
  lecturerId: string
}
```

**Material**
```typescript
{
  id: string
  title: string
  fileName: string
  fileSize: string
  uploadDate: string
  downloadCount: number
  courseId: string
  description?: string
  contentMock?: string       // simulated content for preview
  fileData?: string          // base64 PDF data
}
```

## 🗂️ Storage System

CourseVault uses **browser Local Storage** for data persistence:

- **Flexible Data Structure**: Add courses, materials, lecturers, and departments on the fly
- **File Upload Support**: Base64 encoded PDFs stored directly in localStorage
- **Activity Logging**: All actions logged with timestamps
- **Statistics Tracking**: Monitor download counts per course

## 📱 Page Routes

| Route | Purpose |
|-------|---------|
| `/` | Main home page - browse all courses |
| `/courses/[id]` | Individual course detail page |
| `/admin` | Admin dashboard for content management |

## 🎨 Theming

CourseVault includes a complete theme system with:

- **Automatic Detection**: Respects system color scheme preference
- **Manual Override**: Users can toggle between dark and light modes
- **Persistent State**: Theme preference saved in localStorage
- **Comprehensive Color Palette**: Carefully selected colors for accessibility

### Theme Colors

- **Light Mode**: Clean white backgrounds with dark text
- **Dark Mode**: Sleek dark backgrounds with light text
- **Accent Colors**: Vibrant blues and purples for interactive elements

## 🔑 Key Features Explained

### 📄 PDF Preview
The built-in PDF previewer allows users to:
- View materials without downloading
- Navigate through multiple pages
- Scale and zoom functionality
- Seamless integration with course materials

### 🔎 Advanced Search & Filtering
Filter materials by:
- **Course Level**: First year through final year
- **Semester**: First or second semester
- **Department**: Browse by academic department
- **Lecturer**: Find materials by specific instructors

### 📊 Admin Analytics
Track and analyze:
- Most downloaded materials
- User activity logs
- Upload timestamps
- Storage statistics

## 🌐 Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication system
- [ ] Advanced search with full-text indexing
- [ ] File upload optimization
- [ ] API for programmatic access
- [ ] Email notifications for new materials
- [ ] Material recommendations engine
- [ ] Offline access support
- [ ] Mobile app versions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**demonichacker** - [GitHub](https://github.com/demonichacker)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI Components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Analytics powered by [Vercel Analytics](https://vercel.com/analytics)

## 📞 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/demonichacker/vault/issues) on the GitHub repository.

---

**CourseVault** - Empowering Academic Excellence Through Digital Libraries 🎓
