"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "sm" | "default" | "md" | "lg" | "xl"
}) {
  const sizeMap = {
    sm: "var(--size-xs)",
    default: "var(--size-sm)", 
    md: "var(--size-md)",
    lg: "var(--size-lg)",
    xl: "var(--size-xl)"
  }
  
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        className
      )}
      style={{ 
        width: sizeMap[size], 
        height: sizeMap[size],
        borderRadius: "var(--radius-lg)"
      }}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center",
        className
      )}
      style={{ 
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        borderRadius: "var(--radius-lg)"
      }}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
