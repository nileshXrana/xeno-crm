"use client";

import { useState } from "react";
import { Plus, Trash2, Users, Wand2, Send, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

const FIELDS = [
  { value: "totalSpends", label: "Total Spends (₹)" },
  { value: "visits", label: "Number of Visits" },
  { value: "lastVisitDate", label: "Last Visit Date" },
];

const OPERATORS = [
  { value: ">", label: "greater than (>)" },
  { value: ">=", label: "greater than or equal (≥)" },
  { value: "<", label: "less than (<)" },
  { value: "<=", label: "less than or equal (≤)" },
  { value: "==", label: "equal to (=)" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

interface AudienceBuilderProps {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  audienceCount: number | null;
  checkingAudience: boolean;
  onCheckAudience: () => void;
}

export default function AudienceBuilder({
  rules,
  setRules,
  audienceCount,
  checkingAudience,
  onCheckAudience,
}: AudienceBuilderProps) {
  function addRule() {
    setRules((prev) => [
      ...prev,
      {
        id: generateId(),
        field: "totalSpends",
        operator: ">",
        value: "",
        logic: "AND",
      },
    ]);
  }

  function removeRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRule(id: string, key: keyof Rule, val: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    );
  }

  return (
    <div className="space-y-4">
      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div key={rule.id} className="animate-slide-in-left">
            {/* Logic connector between rules */}
            {idx > 0 && (
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <Select
                  value={rules[idx - 1].logic}
                  onValueChange={(v) => updateRule(rules[idx - 1].id, "logic", v)}
                >
                  <SelectTrigger className="w-20 h-7 text-xs bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border/50">
              {/* Field selector */}
              <Select
                value={rule.field}
                onValueChange={(v) => updateRule(rule.id, "field", v)}
              >
                <SelectTrigger className="flex-1 bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {FIELDS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator selector */}
              <Select
                value={rule.operator}
                onValueChange={(v) => updateRule(rule.id, "operator", v)}
              >
                <SelectTrigger className="w-44 bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value input */}
              <Input
                value={rule.value}
                onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                placeholder={rule.field === "lastVisitDate" ? "YYYY-MM-DD" : "Enter value"}
                className="w-36 bg-secondary border-border text-sm h-9"
                type={rule.field === "lastVisitDate" ? "date" : "number"}
              />

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(rule.id)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule */}
      <Button
        variant="outline"
        size="sm"
        onClick={addRule}
        className="border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition
      </Button>

      {/* Check Audience */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={onCheckAudience}
          disabled={checkingAudience || rules.length === 0 || rules.some((r) => !r.value)}
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          {checkingAudience ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Users className="w-4 h-4 mr-2" />
          )}
          {checkingAudience ? "Checking..." : "Check Audience Size"}
        </Button>

        {audienceCount !== null && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-primary">
                {audienceCount}
              </span>
              <span className="text-xs text-muted-foreground">customers</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
