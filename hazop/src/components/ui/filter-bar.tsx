"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  id: string;
  label: string;
  type: "search" | "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
}

interface FilterBarProps {
  filters: FilterField[];
  resultCount?: number;
  totalCount?: number;
  className?: string;
  compact?: boolean;
}

export function FilterBar({
  filters,
  resultCount,
  totalCount,
  className,
  compact = false,
}: FilterBarProps) {
  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-4", className)}>
        {filters.map((filter) => (
          <div key={filter.id} className="flex-1 min-w-[200px]">
            {filter.type === "search" ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={filter.placeholder || "Search..."}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            ) : (
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        {resultCount !== undefined && totalCount !== undefined && (
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {resultCount} of {totalCount}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <CardTitle className="text-base">Filters</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <Label htmlFor={filter.id}>{filter.label}</Label>
              {filter.type === "search" ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={filter.id}
                    placeholder={filter.placeholder || "Search..."}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              ) : (
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger id={filter.id}>
                    <SelectValue placeholder={filter.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
        {resultCount !== undefined && totalCount !== undefined && (
          <p className="mt-4 text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount} results
          </p>
        )}
      </CardContent>
    </Card>
  );
}
