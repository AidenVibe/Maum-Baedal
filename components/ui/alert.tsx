import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-violet-50 text-violet-800 border-violet-200 [&>svg]:text-violet-600",
        destructive:
          "bg-red-50 text-red-800 border-red-200 [&>svg]:text-red-600",
        success:
          "bg-green-50 text-green-800 border-green-200 [&>svg]:text-green-600",
        warning:
          "bg-yellow-50 text-yellow-800 border-yellow-200 [&>svg]:text-yellow-600",
        info:
          "bg-blue-50 text-blue-800 border-blue-200 [&>svg]:text-blue-600",
        lavender:
          "bg-violet-50 text-violet-800 border-violet-200 [&>svg]:text-violet-600",
        peach:
          "bg-yellow-50 text-yellow-800 border-yellow-200 [&>svg]:text-yellow-600",
        solo:
          "bg-purple-50 text-purple-800 border-purple-200 [&>svg]:text-purple-600",
        companion:
          "bg-violet-50 text-violet-800 border-violet-200 [&>svg]:text-violet-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }