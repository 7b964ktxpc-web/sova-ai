import * as React from "react"
import { cn } from "@/lib/utils"

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
}

const alertVariants = {
  default: "border-border bg-background text-foreground",
  destructive: "border-destructive/50 text-destructive dark:border-destructive",
  success: "border-green-500/50 text-green-700 dark:border-green-500",
  warning: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500",
  info: "border-blue-500/50 text-blue-700 dark:border-blue-500",
}

export function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 flex items-start gap-3",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}
