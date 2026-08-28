"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit2, 
  Save, 
  X, 
  UserPlus, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Assignment {
  id: string;
  userId: string;
  role: string;
  status: string;
  dueDate: string | null;
  user: Member;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  user: Member;
  createdAt: string;
  edited: boolean;
}

interface Deviation {
  id: string;
  parameter: string;
  guideWord: string;
  deviation: string;
  cause: string | null;
  consequence: string | null;
  safeguards: string | null;
  recommendations: string | null;
  status: string;
  severity: number | null;
  likelihood: number | null;
  riskLevel: string | null;
  assignments?: Assignment[];
  comments?: Comment[];
  _count?: { comments: number; assignments: number };
}

interface Node {
  id: string;
  name: string;
  deviations: Deviation[];
}

interface InteractiveWorksheetProps {
  nodes: Node[];
  members: Member[];
  canEdit: boolean;
}

interface EditingCell {
  deviationId: string;
  field: string;
}

export function InteractiveWorksheet({ 
  nodes, 
  members,
  canEdit
}: InteractiveWorksheetProps) {
  const searchParams = useSearchParams();
  const highlightDeviationId = searchParams.get("deviation");
  
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedDeviation, setSelectedDeviation] = useState<Deviation | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightDeviationId);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Scroll to highlighted deviation on mount
  useEffect(() => {
    if (highlightDeviationId) {
      const element = rowRefs.current.get(highlightDeviationId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    }
  }, [highlightDeviationId]);

  const allDeviations = nodes.flatMap((node) =>
    node.deviations.map((dev) => ({ ...dev, nodeName: node.name }))
  );

  const startEdit = (deviationId: string, field: string, currentValue: string | null) => {
    if (!canEdit) return;
    setEditingCell({ deviationId, field });
    setEditValue(currentValue || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async (deviationId: string, field: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/deviations/${deviationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: editValue }),
      });

      if (res.ok) {
        setEditingCell(null);
        setEditValue("");
        window.location.reload(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (deviationId: string, newStatus: string) => {
    try {
      await fetch(`/api/deviations/${deviationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const updateRisk = async (deviationId: string, field: "severity" | "likelihood", value: number) => {
    try {
      await fetch(`/api/deviations/${deviationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to update risk:", error);
    }
  };

  const getRiskBadgeVariant = (risk: string | null) => {
    if (!risk) return "outline";
    return risk === "CRITICAL" ? "destructive" :
      risk === "HIGH" ? "destructive" :
      risk === "MEDIUM" ? "default" : "secondary";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CLOSED":
      case "RESOLVED":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-3 w-3 text-blue-500" />;
      case "OPEN":
        return <AlertCircle className="h-3 w-3 text-orange-500" />;
      default:
        return null;
    }
  };

  const renderEditableCell = (
    deviation: Deviation,
    field: keyof Deviation,
    label: string,
    className?: string
  ) => {
    const isEditing = editingCell?.deviationId === deviation.id && editingCell?.field === field;
    const value = deviation[field] as string | null;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-15 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                saveEdit(deviation.id, field);
              } else if (e.key === "Escape") {
                cancelEdit();
              }
            }}
          />
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              className="h-7 w-7"
              onClick={() => saveEdit(deviation.id, field)}
              disabled={saving}
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={cancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "group relative cursor-pointer hover:bg-muted/50 p-2 rounded min-h-10",
          !value && "text-muted-foreground italic",
          className
        )}
        onClick={() => startEdit(deviation.id, field, value)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm wrap-break-word flex-1">
            {value || `Click to add ${label.toLowerCase()}`}
          </span>
          {canEdit && (
            <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </div>
    );
  };

  if (allDeviations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No deviations recorded yet. Add deviations to your nodes.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="text-left p-3 font-semibold border">Node</th>
              <th className="text-left p-3 font-semibold border">Parameter</th>
              <th className="text-left p-3 font-semibold border">Guide Word</th>
              <th className="text-left p-3 font-semibold border min-w-50">Cause</th>
              <th className="text-left p-3 font-semibold border min-w-50">Consequence</th>
              <th className="text-left p-3 font-semibold border min-w-50">Safeguards</th>
              <th className="text-center p-3 font-semibold border w-16">S</th>
              <th className="text-center p-3 font-semibold border w-16">L</th>
              <th className="text-center p-3 font-semibold border w-24">Risk</th>
              <th className="text-left p-3 font-semibold border min-w-50">Recommendations</th>
              <th className="text-center p-3 font-semibold border w-32">Status</th>
              <th className="text-center p-3 font-semibold border w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allDeviations.map((dev) => (
              <tr 
                key={dev.id} 
                ref={(el) => {
                  if (el) rowRefs.current.set(dev.id, el);
                }}
                className={cn(
                  "border-b hover:bg-muted/30 transition-colors",
                  highlightedId === dev.id && "bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-500 ring-inset"
                )}
              >
                <td className="p-3 font-medium border">{(dev as unknown as { nodeName: string }).nodeName}</td>
                <td className="p-3 border">{dev.parameter}</td>
                <td className="p-3 border">
                  <Badge variant="secondary">{dev.guideWord}</Badge>
                </td>
                <td className="p-0 border">
                  {renderEditableCell(dev, "cause", "Cause")}
                </td>
                <td className="p-0 border">
                  {renderEditableCell(dev, "consequence", "Consequence")}
                </td>
                <td className="p-0 border">
                  {renderEditableCell(dev, "safeguards", "Safeguards")}
                </td>
                <td className="p-2 text-center border">
                  <Select
                    value={dev.severity?.toString() || ""}
                    onValueChange={(val) => updateRisk(dev.id, "severity", parseInt(val))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-8 w-12 text-xs">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 text-center border">
                  <Select
                    value={dev.likelihood?.toString() || ""}
                    onValueChange={(val) => updateRisk(dev.id, "likelihood", parseInt(val))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-8 w-12 text-xs">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 text-center border">
                  <Badge variant={getRiskBadgeVariant(dev.riskLevel)} className="text-xs">
                    {dev.riskLevel || "-"}
                  </Badge>
                </td>
                <td className="p-0 border">
                  {renderEditableCell(dev, "recommendations", "Recommendations")}
                </td>
                <td className="p-2 text-center border">
                  <Select
                    value={dev.status}
                    onValueChange={(val) => updateStatus(dev.id, val)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(dev.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 border">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 relative"
                      onClick={() => {
                        setSelectedDeviation(dev);
                        setAssignDialogOpen(true);
                      }}
                      title="Assign to member"
                    >
                      <UserPlus className="h-3 w-3" />
                      {dev._count?.assignments ? (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                          {dev._count.assignments}
                        </span>
                      ) : null}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 relative"
                      onClick={() => {
                        setSelectedDeviation(dev);
                        setCommentDialogOpen(true);
                      }}
                      title="Comments"
                    >
                      <MessageSquare className="h-3 w-3" />
                      {dev._count?.comments ? (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">
                          {dev._count.comments}
                        </span>
                      ) : null}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        deviation={selectedDeviation}
        members={members}
      />

      {/* Comment Dialog */}
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        deviation={selectedDeviation}
      />
    </>
  );
}

// Assignment Dialog Component
function AssignmentDialog({
  open,
  onOpenChange,
  deviation,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviation: Deviation | null;
  members: Member[];
}) {
  const [selectedMember, setSelectedMember] = useState("");
  const [role, setRole] = useState<"RESPONSIBLE" | "REVIEWER">("RESPONSIBLE");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!deviation || !selectedMember) return;

    setAssigning(true);
    try {
      const res = await fetch(`/api/deviations/${deviation.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedMember,
          role,
          dueDate: dueDate || null,
          notes,
        }),
      });

      if (res.ok) {
        onOpenChange(false);
        setSelectedMember("");
        setNotes("");
        setDueDate("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to assign:", error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Deviation</DialogTitle>
          <DialogDescription>
            {deviation && `${deviation.guideWord} ${deviation.parameter}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignments */}
          {deviation?.assignments && deviation.assignments.length > 0 && (
            <div className="space-y-2">
              <Label>Current Assignments</Label>
              <div className="space-y-1">
                {deviation.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignment.user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {assignment.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{assignment.user.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(val: "RESPONSIBLE" | "REVIEWER") => setRole(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESPONSIBLE">Responsible (Resolver)</SelectItem>
                <SelectItem value="REVIEWER">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedMember || assigning}>
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Comment Dialog Component
function CommentDialog({
  open,
  onOpenChange,
  deviation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviation: Deviation | null;
}) {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePostComment = async () => {
    if (!deviation || !comment.trim()) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/deviations/${deviation.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        setComment("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            {deviation && `${deviation.guideWord} ${deviation.parameter}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-100 overflow-y-auto">
          {deviation?.comments && deviation.comments.length > 0 ? (
            deviation.comments.map((c) => (
              <div key={c.id} className="flex gap-3 p-3 border rounded">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.user.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {c.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{c.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    {c.edited && (
                      <Badge variant="outline" className="text-xs">
                        edited
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Add Comment</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment... (use @name to mention someone)"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePostComment} disabled={!comment.trim() || posting}>
            {posting ? "Posting..." : "Post Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
