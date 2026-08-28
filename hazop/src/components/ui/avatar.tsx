"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  size?: "xs" | "sm" | "default" | "lg" | "xl"
}

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none",
        size === "xs" && "size-6",
        size === "sm" && "size-8",
        size === "default" && "size-10",
        size === "lg" && "size-12",
        size === "xl" && "size-16",
        className
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends React.ComponentProps<typeof AvatarPrimitive.Image> {
  src?: string
}

function AvatarImage({
  className,
  src,
  ...props
}: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      src={src}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  name?: string
  colorSeed?: string
}

// Generate initials from name
function getInitials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Generate consistent color based on string
function getColorFromString(str: string): string {
  const colors = [
    "bg-red-500 text-white",
    "bg-orange-500 text-white",
    "bg-amber-500 text-white",
    "bg-yellow-500 text-black",
    "bg-lime-500 text-black",
    "bg-green-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-black",
    "bg-sky-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-violet-500 text-white",
    "bg-purple-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-pink-500 text-white",
    "bg-rose-500 text-white",
  ]
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function AvatarFallback({
  className,
  name,
  colorSeed,
  children,
  ...props
}: AvatarFallbackProps) {
  const initials = name ? getInitials(name) : null
  const colorClass = colorSeed || name ? getColorFromString(colorSeed || name || "") : ""
  
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full font-medium",
        colorClass || "bg-muted text-muted-foreground",
        "group-data-[size=xs]/avatar:text-[10px]",
        "group-data-[size=sm]/avatar:text-xs",
        "group-data-[size=default]/avatar:text-sm",
        "group-data-[size=lg]/avatar:text-base",
        "group-data-[size=xl]/avatar:text-lg",
        className
      )}
      {...props}
    >
      {children || initials}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
}
