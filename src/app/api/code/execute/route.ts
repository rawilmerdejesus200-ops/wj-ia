import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { language, code } = await req.json()
  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 })
  }

  try {
    let output = ""

    if (language === "javascript" || language === "typescript") {
      const vm = require("node:vm")
      const sandbox = {
        console: { log: (...args: unknown[]) => { output += args.map(String).join(" ") + "\n" } },
        setTimeout: () => {},
        clearTimeout: () => {},
        Math, JSON, Date, Array, Object, String, Number, Boolean, Map, Set, RegExp, Error,
      }

      vm.createContext(sandbox)
      const script = new vm.Script(code, { timeout: 5000 })
      const result = script.runInContext(sandbox, { timeout: 5000 })
      if (result !== undefined && output.trim() === "") {
        output = String(result)
      }
    } else if (language === "python") {
      const { execSync } = require("node:child_process")
      try {
        output = execSync(`python3 -c "${code.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`, {
          timeout: 10000,
          encoding: "utf-8",
        })
      } catch {
        output = execSync(`python -c "${code.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`, {
          timeout: 10000,
          encoding: "utf-8",
        })
      }
    } else {
      output = `Execution for ${language} is not supported in this environment.\nSupported: JavaScript, TypeScript, Python`
    }

    return NextResponse.json({ output: output || "(no output)" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown execution error"
    return NextResponse.json({ output: `Error: ${message}` }, { status: 200 })
  }
}
