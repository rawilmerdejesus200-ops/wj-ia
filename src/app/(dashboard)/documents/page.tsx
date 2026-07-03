"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, Sparkles, Loader2, File, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import toast from "react-hot-toast"

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const dropRef = useRef<HTMLDivElement>(null)

  async function handleUpload() {
    if (!file || loading) return

    setLoading(true)
    setAnalysis("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        toast.success("Document analyzed!")
      } else {
        toast.error(data.error ?? "Failed to analyze document")
      }
    } catch {
      toast.error("Error analyzing document")
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Document Analysis</h1>
        <p className="text-sm text-muted-foreground">Upload and analyze documents with AI</p>
      </div>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-colors hover:border-violet-500/50"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {file ? (
          <div className="text-center">
            <File className="mx-auto mb-4 h-10 w-10 text-violet-400" />
            <p className="mb-1 text-sm font-medium">{file.name}</p>
            <p className="mb-4 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); setFile(null) }} variant="outline" className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpload() }} loading={loading} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Analyze
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">PDF, Word, Excel, Images (text extraction)</p>
            <Button className="mt-4 gap-2">
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.md,.csv,.json,.xml,.html,.pdf"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          <span className="text-sm text-muted-foreground">Analyzing document...</span>
        </div>
      )}

      {analysis && (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
