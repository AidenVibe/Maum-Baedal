'use client'

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface ColorSwatchProps {
  name: string
  hex: string
  className: string
  description?: string
  cssVar?: string
}

function ColorSwatch({ name, hex, className, description, cssVar }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* 색상 샘플 */}
      <div 
        className="h-24 flex items-center justify-center cursor-pointer group relative"
        style={{ 
          backgroundColor: hex,
          background: hex,
          backgroundImage: 'none'
        }}
        onClick={handleCopy}
        title={`${hex} 복사하기`}
      >
        <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          {copied ? (
            <Check className="h-6 w-6 text-white drop-shadow-lg" />
          ) : (
            <Copy className="h-6 w-6 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      
      {/* 색상 정보 */}
      <div className="p-3 space-y-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-sm text-gray-600 font-mono">{hex}</div>
        {cssVar && (
          <div className="text-xs text-gray-500 font-mono">var(--{cssVar})</div>
        )}
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
    </div>
  )
}

interface ColorPaletteProps {
  title: string
  colors: ColorSwatchProps[]
  className?: string
}

export function ColorPalette({ title, colors, className = "" }: ColorPaletteProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color, index) => (
          <ColorSwatch key={index} {...color} />
        ))}
      </div>
    </div>
  )
}

interface GradientSwatchProps {
  name: string
  gradient: string
  description?: string
}

function GradientSwatch({ name, gradient, description }: GradientSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gradient)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* 그라디언트 샘플 */}
      <div 
        className="h-24 cursor-pointer group relative"
        style={{ 
          background: gradient,
          backgroundImage: gradient
        }}
        onClick={handleCopy}
        title={`${gradient} 복사하기`}
      >
        <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          {copied ? (
            <Check className="h-6 w-6 text-white drop-shadow-lg" />
          ) : (
            <Copy className="h-6 w-6 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      
      {/* 그라디언트 정보 */}
      <div className="p-3 space-y-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-600 font-mono break-all">{gradient}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
    </div>
  )
}

interface GradientPaletteProps {
  title: string
  gradients: GradientSwatchProps[]
  className?: string
}

export function GradientPalette({ title, gradients, className = "" }: GradientPaletteProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gradients.map((gradient, index) => (
          <GradientSwatch key={index} {...gradient} />
        ))}
      </div>
    </div>
  )
}