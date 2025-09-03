import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-violet-100",
  {
    variants: {
      variant: {
        default: "bg-violet-100",
        peach: "bg-yellow-100",
        lavender: "bg-violet-100",
        blue: "bg-blue-100",
        green: "bg-green-100",
        gray: "bg-gray-200",
        solo: "bg-purple-100",
        companion: "bg-violet-100",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(progressVariants({ variant, size, className }))}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-violet-500 transition-all duration-300 ease-in-out",
          variant === "peach" && "bg-yellow-500",
          variant === "lavender" && "bg-violet-500",
          variant === "blue" && "bg-blue-500",
          variant === "green" && "bg-green-500",
          variant === "gray" && "bg-gray-500",
          variant === "solo" && "bg-purple-500",
          variant === "companion" && "bg-violet-500"
        )}
        style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress, progressVariants }