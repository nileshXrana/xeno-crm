"use client";

import { Plus, Trash2, Users, RefreshCw, Sparkles, Coins, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

const FIELDS = [
  { value: "totalSpends", label: "Total Spends (₹)", icon: Coins },
  { value: "visits", label: "Visits Count", icon: Activity },
  { value: "lastVisitDate", label: "Last Visit Date", icon: Calendar },
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
    if (rules.length === 1) return; // Keep at least one condition
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRule(id: string, key: keyof Rule, val: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Rule Node List */}
      <div className="relative pl-4 border-l border-border/80 ml-2 space-y-4">
        {rules.map((rule, idx) => {
          const matchedField = FIELDS.find(f => f.value === rule.field) || FIELDS[0];
          const FieldIcon = matchedField.icon;

          return (
            <div key={rule.id} className="relative animate-slide-in-left">
              {/* Connector Node Indicator Dot */}
              <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background z-10" />

              {/* Logic Connector Ribbon between rules */}
              {idx > 0 && (
                <div className="absolute -top-6 -left-[20px] h-6 flex items-center justify-center">
                  <Select
                    value={rules[idx - 1].logic}
                    onValueChange={(v) => v && updateRule(rules[idx - 1].id, "logic", v)}
                  >
                    <SelectTrigger className="w-16 h-5 text-[9px] font-extrabold uppercase bg-secondary/90 hover:bg-secondary border border-border/80 rounded-full px-2 shadow-xs transition-colors z-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="AND" className="text-[10px] font-bold">AND</SelectItem>
                      <SelectItem value="OR" className="text-[10px] font-bold">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Node Card wrapper */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-secondary/15 rounded-2xl border border-border/40 hover:border-border transition-all">
                {/* Field Selector */}
                <div className="flex-1 w-full flex items-center gap-2.5 bg-secondary/35 border border-border/30 rounded-xl px-3 py-1">
                  <FieldIcon className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={rule.field}
                    onValueChange={(v) => v && updateRule(rule.id, "field", v)}
                  >
                    <SelectTrigger className="bg-transparent border-0 ring-0 focus:ring-0 text-xs font-bold text-foreground h-8 p-0 flex-1 hover:bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-xs font-semibold">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator Selector */}
                <div className="w-full sm:w-44 bg-secondary/35 border border-border/30 rounded-xl px-3 py-1">
                  <Select
                    value={rule.operator}
                    onValueChange={(v) => v && updateRule(rule.id, "operator", v)}
                  >
                    <SelectTrigger className="bg-transparent border-0 ring-0 focus:ring-0 text-xs font-bold text-foreground h-8 p-0 flex-1 hover:bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value} className="text-xs font-semibold">
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value Input */}
                <div className="w-full sm:w-36 bg-secondary/35 border border-border/30 rounded-xl px-3 py-1 flex items-center">
                  <Input
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                    placeholder={rule.field === "lastVisitDate" ? "YYYY-MM-DD" : "Value"}
                    className="bg-transparent border-0 text-xs font-bold h-8 p-0 w-full focus-visible:ring-0"
                    type={rule.field === "lastVisitDate" ? "date" : "number"}
                  />
                </div>

                {/* Remove Condition */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(rule.id)}
                  disabled={rules.length === 1}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-end sm:self-auto flex-shrink-0 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          className="border-dashed border-border/80 hover:border-primary/80 hover:text-primary text-xs font-bold py-2 px-4 rounded-xl transition-all w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Add Condition Rule
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={onCheckAudience}
            disabled={checkingAudience || rules.length === 0 || rules.some((r) => !r.value)}
            className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold py-2 px-4 rounded-xl transition-all w-full sm:w-auto"
          >
            {checkingAudience ? (
              <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Users className="w-3.5 h-3.5 mr-2" />
            )}
            {checkingAudience ? "Querying Database..." : "Compile Segment Size"}
          </Button>

          {audienceCount !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/15 rounded-xl animate-fade-in shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs font-extrabold text-primary">
                {audienceCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">matched</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
