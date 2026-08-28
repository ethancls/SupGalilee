"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Loader2, Trash2 } from "lucide-react"

interface CriticalDeleteDialogProps {
  title: string
  description: React.ReactNode
  validationText: string
  onConfirm: () => Promise<void>
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  confirmButtonText?: string
}

export function CriticalDeleteDialog({
  title,
  description,
  validationText,
  onConfirm,
  trigger,
  isOpen,
  onOpenChange,
  confirmButtonText = "Delete",
}: CriticalDeleteDialogProps) {
  const [input, setInput] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [internalOpen, setInternalOpen] = React.useState(false)

  const open = isOpen !== undefined ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleCopy = () => {
    navigator.clipboard.writeText(validationText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    if (input !== validationText) return
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setInput("")
      setIsDeleting(false)
    }
  }, [open])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-foreground">
              {description}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md border border-border">
                  <code className="font-mono font-bold text-sm select-all">{validationText}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    To confirm, type the name above:
                  </p>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter name"
                    className="font-mono border-destructive/20 focus-visible:ring-destructive/20"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isDeleting || input !== validationText}
            variant="destructive"
            className="gap-2"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
