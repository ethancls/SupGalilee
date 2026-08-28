"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Check, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonStatus = "idle" | "loading" | "success" | "error";

interface StatusButtonProps extends ButtonProps {
  status: ButtonStatus;
  idleText?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  icon?: React.ReactNode;
  onStatusReset?: () => void;
  resetDelay?: number;
}

export const StatusButton = React.forwardRef<HTMLButtonElement, StatusButtonProps>(
  (
    {
      status,
      idleText = "Save",
      loadingText = "Saving...",
      successText = "Saved",
      errorText = "Error",
      icon = <Save className="mr-2 h-4 w-4" />,
      className,
      children,
      onStatusReset,
      resetDelay = 2000,
      disabled,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (status === "success" || status === "error") {
        const timer = setTimeout(() => {
          if (onStatusReset) {
            onStatusReset();
          }
        }, resetDelay);
        return () => clearTimeout(timer);
      }
    }, [status, resetDelay, onStatusReset]);

    const getVariant = () => {
      switch (status) {
        case "success":
          return "default"; // Will be styled green
        case "error":
          return "destructive";
        default:
          return props.variant || "default";
      }
    };

    const isIdle = status === "idle";
    const isLoading = status === "loading";
    const isSuccess = status === "success";
    const isError = status === "error";

    return (
      <Button
        ref={ref}
        variant={getVariant()}
        disabled={isLoading || disabled}
        className={cn(
          "transition-all duration-300 min-w-[100px]",
          isSuccess && "bg-green-600 hover:bg-green-700 text-white border-green-600",
          isError && "bg-destructive text-destructive-foreground",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSuccess && <Check className="mr-2 h-4 w-4 animate-in zoom-in" />}
        {isError && <X className="mr-2 h-4 w-4 animate-in zoom-in" />}
        {isIdle && icon}
        
        {isIdle && (children || idleText)}
        {isLoading && loadingText}
        {isSuccess && successText}
        {isError && errorText}
      </Button>
    );
  }
);
StatusButton.displayName = "StatusButton";
