import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-500 text-white active:bg-violet-600",
        secondary:
          "border-transparent bg-yellow-400 text-yellow-900 active:bg-yellow-500",
        destructive:
          "border-transparent bg-red-500 text-white active:bg-red-600",
        outline: "text-foreground border-violet-200",
        lavender:
          "border-transparent bg-violet-100 text-violet-800 active:bg-violet-200",
        peach:
          "border-transparent bg-yellow-100 text-yellow-800 active:bg-yellow-200",
        success:
          "border-transparent bg-green-100 text-green-800 active:bg-green-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 active:bg-blue-200",
        solo:
          "border-transparent bg-purple-100 text-purple-800 active:bg-purple-200",
        companion:
          "border-transparent bg-violet-100 text-violet-800 active:bg-violet-200",
        opened:
          "border-transparent bg-green-100 text-green-800 active:bg-green-200",
        waiting:
          "border-transparent bg-gray-100 text-gray-700 active:bg-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }