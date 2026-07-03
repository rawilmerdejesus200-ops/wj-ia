"use client"

import { Button } from "@/components/ui/button"
import { Play, Copy, Sparkles, Loader2, Terminal } from "lucide-react"
import { useState, useRef } from "react"
import toast from "react-hot-toast"

const DEFAULT_CODE = `// Welcome to WJ.IA Code Editor
// Write your code here and run it

function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log("Fibonacci(10):", fibonacci(10))
`

export default function CodePage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState("javascript")
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState("")
  const outputRef = useRef<HTMLDivElement>(null)

  const editorBg = language === "python" ? "bg-[#1e1e1e]" : "bg-[#1e1e1e]"

  function handleCopy() {
    navigator.clipboard.writeText(code)
    toast.success("Copied!")
  }

  async function handleRun() {
    setRunning(true)
    setOutput("Running...")
    try {
      const res = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      })
      const data = await res.json()
      setOutput(data.output)
    } catch {
      setOutput("Error: Failed to execute code")
    } finally {
      setRunning(false)
      outputRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = code.substring(0, start) + "  " + code.substring(end)
      setCode(newValue)
      requestAnimationFrame(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
      })
    }
  }

  const languageColors: Record<string, string> = {
    javascript: "text-yellow-400",
    typescript: "text-blue-400",
    python: "text-green-400",
    rust: "text-orange-400",
    go: "text-cyan-400",
    java: "text-red-400",
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-medium ${languageColors[language] ?? "text-foreground"}`}>
            {language}
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button size="sm" onClick={handleRun} loading={running} className="gap-1.5">
            <Play className="h-4 w-4" /> Run
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className={`flex-1 ${editorBg} font-mono`}>
          <div className="flex items-center gap-2 border-b border-[#333] px-4 py-1.5">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-[#888]">main.{language === "javascript" ? "js" : language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-full w-full resize-none border-0 bg-transparent p-4 text-sm leading-relaxed text-[#d4d4d4] outline-none scrollbar-hide selection:bg-[#264f78] placeholder:text-[#555]"
            spellCheck={false}
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
          />
        </div>

        <div className="flex w-full flex-col border-t border-[#333] md:w-96 md:border-l md:border-t-0">
          <div className="flex items-center gap-2 border-b border-[#333] bg-[#1e1e1e] px-4 py-2">
            <Terminal className="h-4 w-4 text-[#888]" />
            <span className="text-xs font-medium text-[#888]">Output</span>
          </div>
          <div
            ref={outputRef}
            className="flex-1 overflow-auto bg-[#1e1e1e] p-4 font-mono text-sm leading-relaxed scrollbar-hide"
          >
            {output ? (
              <pre className="whitespace-pre-wrap text-[#d4d4d4]">{output}</pre>
            ) : (
              <span className="text-[#555]">Run your code to see output here</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
