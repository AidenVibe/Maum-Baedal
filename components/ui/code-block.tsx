'use client'

import { useState } from "react"
import { Button } from "./button"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  children: React.ReactNode
  language?: string
  title?: string
  className?: string
}

export function CodeBlock({ children, language, title, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">{title}</span>
          {language && (
            <span className="text-xs text-gray-400 uppercase">{language}</span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
          aria-label="코드 복사"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        
        <pre className="p-4 pr-12 text-sm text-gray-100 overflow-x-auto">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  )
}

interface InlineCodeProps {
  children: React.ReactNode
  copyable?: boolean
}

export function InlineCode({ children, copyable = false }: InlineCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }

  if (copyable) {
    return (
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
        title="클릭하여 복사"
      >
        {children}
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3 text-gray-500" />
        )}
      </button>
    )
  }

  return (
    <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-900">
      {children}
    </code>
  )
}