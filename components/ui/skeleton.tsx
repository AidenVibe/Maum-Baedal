import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-lg bg-violet-100",
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
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton, skeletonVariants }