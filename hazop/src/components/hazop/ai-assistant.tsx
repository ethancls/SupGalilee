"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GUIDE_WORDS, HAZOP_PARAMETERS } from "@/lib/hazop/templates";

interface AIAnalysisResult {
  deviation: string;
  causes: string[];
  consequences: string[];
  safeguards: string[];
  recommendations: string[];
  suggestedSeverity: number;
  suggestedLikelihood: number;
}

interface HAZOPAIAssistantProps {
  organizationId: string;
  nodeId: string;
  nodeName: string;
  nodeDescription?: string;
  designIntent?: string;
  onApplyAnalysis: (analysis: AIAnalysisResult, parameter: string, guideWord: string) => void;
  aiEnabled: boolean;
}

export function HAZOPAIAssistant({
  organizationId,
  nodeId,
  nodeName,
  nodeDescription,
  designIntent,
  onApplyAnalysis,
  aiEnabled,
}: HAZOPAIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [parameter, setParameter] = useState("");
  const [guideWord, setGuideWord] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!parameter || !guideWord) return;

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          nodeId,
          parameter,
          guideWord,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyAnalysis(result, parameter, guideWord);
      setOpen(false);
      setResult(null);
      setParameter("");
      setGuideWord("");
    }
  };

  const getRiskLevel = (severity: number, likelihood: number): string => {
    const score = severity * likelihood;
    if (score >= 20) return "CRITICAL";
    if (score >= 12) return "HIGH";
    if (score >= 6) return "MEDIUM";
    return "LOW";
  };

  if (!aiEnabled) {
    return (
      <Button variant="outline" size="sm" disabled title="Configure AI in organization settings">
        <Sparkles className="h-4 w-4 mr-2 opacity-50" />
        AI Analysis
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI HAZOP Analysis
          </DialogTitle>
          <DialogDescription>
            Generate causes, consequences, and recommendations for a deviation using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Node Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{nodeName}</p>
            {nodeDescription && (
              <p className="text-sm text-muted-foreground">{nodeDescription}</p>
            )}
            {designIntent && (
              <p className="text-xs text-muted-foreground mt-1">
                Intent: {designIntent}
              </p>
            )}
          </div>

          {/* Parameter and Guide Word Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Parameter</Label>
              <Select value={parameter} onValueChange={setParameter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {HAZOP_PARAMETERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Guide Word</Label>
              <Select value={guideWord} onValueChange={setGuideWord}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guide word" />
                </SelectTrigger>
                <SelectContent>
                  {GUIDE_WORDS.map((gw) => (
                    <SelectItem key={gw.word} value={gw.word}>
                      <div>
                        <span className="font-medium">{gw.word}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {gw.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {parameter && guideWord && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded">
              <span className="text-sm">Deviation:</span>
              <Badge variant="secondary">{guideWord}</Badge>
              <span className="font-medium">{parameter}</span>
            </div>
          )}

          {/* Analyze Button */}
          {!result && (
            <Button
              onClick={handleAnalyze}
              disabled={!parameter || !guideWord || analyzing}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Analysis Complete
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">S: {result.suggestedSeverity}</Badge>
                  <Badge variant="outline">L: {result.suggestedLikelihood}</Badge>
                  <Badge
                    variant={
                      getRiskLevel(result.suggestedSeverity, result.suggestedLikelihood) === "CRITICAL" ||
                      getRiskLevel(result.suggestedSeverity, result.suggestedLikelihood) === "HIGH"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {getRiskLevel(result.suggestedSeverity, result.suggestedLikelihood)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Deviation</p>
                <p className="text-sm">{result.deviation}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Potential Causes ({result.causes.length})
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.causes.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Consequences ({result.consequences.length})
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.consequences.map((consequence, i) => (
                    <li key={i}>{consequence}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Safeguards ({result.safeguards.length})
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.safeguards.map((safeguard, i) => (
                    <li key={i}>{safeguard}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Recommendations ({result.recommendations.length})
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <>
              <Button variant="outline" onClick={() => setResult(null)}>
                Analyze Another
              </Button>
              <Button onClick={handleApply}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Deviation
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
