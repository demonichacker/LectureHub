'use client'

import React, { useState } from 'react'
import { Material, downloadMaterialFile } from '@/lib/storage'
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Calendar, 
  FileSpreadsheet, 
  FileText,
  User
} from 'lucide-react'

interface PDFPreviewerProps {
  isOpen: boolean
  onClose: () => void
  material: Material | null
  courseCode?: string
  lecturerName?: string
}

export default function PDFPreviewer({ 
  isOpen, 
  onClose, 
  material, 
  courseCode = 'GENERIC', 
  lecturerName = 'Faculty Lecturer' 
}: PDFPreviewerProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activePage, setActivePage] = useState(1)

  if (!isOpen || !material) return null

  // Parse simulated markdown slides (for mock/demo materials)
  const slides = material.contentMock 
    ? material.contentMock.split('## ').filter(Boolean).map(s => '## ' + s)
    : ['## Document Preview\n\nNo preview pages available for this material.']

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const handleDownload = () => {
    downloadMaterialFile(material)
  }

  // True when the admin uploaded a real PDF from their device
  const isRealPDF = !!material.fileData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div 
        className={`bg-card text-card-foreground rounded-xl border border-border shadow-2xl flex flex-col transition-all duration-300 w-full overflow-hidden ${
          isFullscreen ? 'h-full max-w-full' : 'h-[85vh] max-w-5xl'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-muted px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-5 w-5 text-primary shrink-0 animate-pulse" />
            <h3 className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md" title={material.title}>
              {material.title}
            </h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-mono font-medium shrink-0">
              {courseCode}
            </span>
            {isRealPDF && (
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                Real PDF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Zoom controls — only for mock viewer */}
            {!isRealPDF && (
              <div className="hidden sm:flex items-center gap-1 bg-background rounded-lg border border-border p-0.5">
                <button 
                  onClick={handleZoomOut} 
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs px-2 min-w-[3.5rem] text-center font-mono font-medium">
                  {zoom}%
                </span>
                <button 
                  onClick={handleZoomIn} 
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Fullscreen toggle */}
            <button 
              onClick={toggleFullscreen} 
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Download</span>
            </button>

            {/* Close */}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-destructive/15 hover:text-destructive rounded-lg text-muted-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Metadata Sidebar (Hidden on small mobile) */}
          <div className="w-64 border-r border-border bg-muted/30 p-4 hidden md:flex flex-col gap-4 overflow-y-auto shrink-0">
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Material Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">File Name</p>
                    <p className="text-xs font-semibold break-all">{material.fileName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">File Size</p>
                    <p className="text-xs font-semibold">{material.fileSize}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Uploaded On</p>
                    <p className="text-xs font-semibold">{material.uploadDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Lecturer</p>
                    <p className="text-xs font-semibold">{lecturerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {material.description && (
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Abstract / Scope</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {material.description}
                </p>
              </div>
            )}

            <div className="mt-auto border-t border-border pt-4 text-center">
              <span className="text-2xl font-bold font-mono text-primary">{material.downloadCount}</span>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Downloads via Vault</p>
            </div>
          </div>

          {/* PDF Viewer — real iframe for uploaded files, markdown mock for demo materials */}
          {isRealPDF ? (
            <div className="flex-1 bg-zinc-900 overflow-hidden flex flex-col">
              <iframe
                src={material.fileData}
                title={material.title}
                className="flex-1 w-full border-0"
              />
            </div>
          ) : (
            <div className="flex-1 bg-zinc-800 dark:bg-zinc-950 p-4 overflow-y-auto flex flex-col items-center gap-6 select-none relative">
              <div 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="bg-white text-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl rounded-md p-6 sm:p-10 w-full max-w-[700px] min-h-[900px] flex flex-col transition-transform duration-200"
              >
                {/* Paper Watermark / Header */}
                <div className="border-b-2 border-zinc-200 pb-3 mb-6 flex justify-between items-center text-[10px] text-zinc-400 font-bold tracking-wider uppercase">
                  <span>CourseVault Document Archive</span>
                  <span>Page {activePage} of {slides.length}</span>
                </div>

                {/* Render dynamic slide content */}
                <div className="flex-1 flex flex-col justify-start">
                  <div className="prose prose-zinc max-w-none text-zinc-800">
                    {/* Rendering basic parsed headers and text for visual aesthetics */}
                    {slides[activePage - 1]?.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl sm:text-2xl font-bold text-indigo-900 mt-2 mb-4">{line.replace('## ', '')}</h2>
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-md sm:text-lg font-bold text-zinc-700 mt-3 mb-2">{line.replace('### ', '')}</h3>
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-2 my-1 pl-2">
                            <span className="text-indigo-600 font-bold shrink-0 mt-1">•</span>
                            <span className="text-sm text-zinc-600 font-medium">{line.replace('- ', '')}</span>
                          </div>
                        )
                      }
                      if (line.startsWith('```')) {
                        return null // skip raw code block markers
                      }
                      if (line.includes('name =') || line.includes('print(') || line.includes('greet(')) {
                        return (
                          <pre key={idx} className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs p-3 rounded-lg font-mono my-2 overflow-x-auto leading-relaxed">
                            {line}
                          </pre>
                        )
                      }
                      return line.trim() ? <p key={idx} className="text-sm text-zinc-600 leading-relaxed font-medium my-2">{line}</p> : null
                    })}
                  </div>
                </div>

                {/* Footer university seal representation */}
                <div className="border-t border-zinc-100 pt-3 mt-8 flex justify-between items-center text-[9px] text-zinc-400 font-medium">
                  <span>Verified Academic Material</span>
                  <span className="font-mono text-zinc-300">CV-UID: #{material.id.toUpperCase()}</span>
                </div>
              </div>

              {/* Inline Scaling indicator on small devices */}
              <div className="absolute bottom-4 right-4 sm:hidden bg-black/85 text-white px-2.5 py-1 rounded text-xs font-mono font-medium">
                Zoom: {zoom}%
              </div>
            </div>
          )}
        </div>

        {/* Page Switcher Footer — only for mock markdown viewer */}
        {!isRealPDF && slides.length > 1 && (
          <div className="bg-muted px-4 py-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Reading document slides
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setActivePage(p => Math.max(p - 1, 1))}
                disabled={activePage === 1}
                className="px-2.5 py-1 text-xs border border-border bg-background rounded-md hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-bold px-2">
                {activePage} / {slides.length}
              </span>
              <button 
                onClick={() => setActivePage(p => Math.min(p + 1, slides.length))}
                disabled={activePage === slides.length}
                className="px-2.5 py-1 text-xs border border-border bg-background rounded-md hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
