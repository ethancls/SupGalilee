"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProcessNodeData {
  label: string;
  type: string;
  parameters: string[];
}

export const ProcessNode = memo(function ProcessNode({ 
  data, 
  selected 
}: NodeProps & { data: ProcessNodeData }) {
  const getNodeStyle = (type: string) => {
    switch (type) {
      case "vessel":
        return "rounded-full";
      case "pump":
        return "rounded-lg rotate-45";
      case "exchanger":
        return "rounded-sm";
      case "valve":
        return "rounded-none rotate-45 scale-75";
      case "reactor":
        return "rounded-full";
      default:
        return "rounded-lg";
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "vessel":
        return "bg-blue-500/20 border-blue-500";
      case "pump":
        return "bg-green-500/20 border-green-500";
      case "exchanger":
        return "bg-orange-500/20 border-orange-500";
      case "valve":
        return "bg-purple-500/20 border-purple-500";
      case "reactor":
        return "bg-red-500/20 border-red-500";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div
      className={cn(
        "px-4 py-3 min-w-45 bg-card border-2 rounded-lg shadow-md transition-all",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ width: 12, height: 12, background: 'hsl(var(--primary))', border: '2px solid hsl(var(--background))' }}
      />
      
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 border-2 flex items-center justify-center",
            getNodeStyle(data.type),
            getNodeColor(data.type)
          )}
        >
          <span className="text-xs font-bold uppercase">
            {data.type.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{data.label}</p>
          <p className="text-xs text-muted-foreground capitalize">{data.type}</p>
        </div>
      </div>

      {data.parameters && data.parameters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.parameters.slice(0, 3).map((param) => (
            <Badge key={param} variant="secondary" className="text-[10px] px-1.5 py-0">
              {param}
            </Badge>
          ))}
          {data.parameters.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{data.parameters.length - 3}
            </Badge>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ width: 12, height: 12, background: 'hsl(var(--primary))', border: '2px solid hsl(var(--background))' }}
      />
    </div>
  );
});
