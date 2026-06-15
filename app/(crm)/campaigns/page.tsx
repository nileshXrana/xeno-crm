"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Users,
  Wand2,
  Send,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Smartphone,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AudienceBuilder from "@/components/AudienceBuilder";
import AudiencePreview from "@/components/AudiencePreview";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

type Step = 1 | 2 | 3;

function StepIndicator({ step, current, label }: { step: Step; current: Step; label: string }) {
  const isComplete = current > step;
  const isActive = current === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
          isComplete
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
            : isActive
            ? "bg-primary/10 text-primary border border-primary/45 shadow-sm shadow-primary/5"
            : "bg-secondary/60 text-muted-foreground"
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-xs font-bold uppercase tracking-wider ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function CampaignsPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "default",
      field: "totalSpends",
      operator: ">",
      value: "10000",
      logic: "AND",
    },
  ]);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [sampleCustomers, setSampleCustomers] = useState<Array<{_id: string; name: string; email: string; totalSpends: number; visits: number}>>([]);
  const [checkingAudience, setCheckingAudience] = useState(false);

  const [intent, setIntent] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<{
    success: boolean;
    campaignId?: string;
    message?: string;
  } | null>(null);

  // Step 1: Check audience
  async function handleCheckAudience() {
    setCheckingAudience(true);
    setAudienceCount(null);
    try {
      const apiRules = rules.map(({ field, operator, value, logic }) => ({
        field,
        operator,
        value,
        logic,
      }));
      const res = await fetch("/api/crm/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: apiRules }),
      });
      const data = await res.json();
      if (data.success) {
        setAudienceCount(data.count);
        setSampleCustomers(data.sampleCustomers ?? []);
      }
    } catch (err) {
      console.error("Audience check failed:", err);
    } finally {
      setCheckingAudience(false);
    }
  }

  // Step 2: Generate message with AI
  async function handleGenerateMessage() {
    if (!intent.trim()) return;
    setGeneratingMessage(true);
    setGeneratedMessage("");
    try {
      const apiRules = rules.map(({ field, operator, value, logic }) => ({
        field,
        operator,
        value,
        logic,
      }));
      const res = await fetch("/api/crm/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          rules: apiRules,
          audienceCount: audienceCount ?? 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedMessage(data.message);
      }
    } catch (err) {
      console.error("Message generation failed:", err);
    } finally {
      setGeneratingMessage(false);
    }
  }

  // Step 3: Launch campaign
  async function handleLaunchCampaign() {
    if (!campaignName.trim() || !generatedMessage) return;
    setLaunching(true);
    setLaunchResult(null);
    try {
      const apiRules = rules.map(({ field, operator, value, logic }) => ({
        field,
        operator,
        value,
        logic,
      }));
      const res = await fetch("/api/crm/campaign/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          rules: apiRules,
          generatedMessage,
        }),
      });
      const data = await res.json();
      setLaunchResult(data);
    } catch (err) {
      setLaunchResult({ success: false, message: String(err) });
    } finally {
      setLaunching(false);
    }
  }

  // Live WhatsApp Mockup Text Formatter
  const getMockupMessage = (text: string) => {
    if (!text) return "";
    const sampleName = sampleCustomers[0]?.name || "Aarav Sharma";
    const sampleSpends = sampleCustomers[0]?.totalSpends ? `₹${sampleCustomers[0].totalSpends.toLocaleString()}` : "₹15,000";
    return text
      .replace(/\{name\}/g, sampleName)
      .replace(/\{totalSpends\}/g, sampleSpends)
      .replace(/\{visits\}/g, "5");
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Campaign Builder</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Target dynamic segments, generate copy via Gemini, and track execution dispatch
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex flex-wrap items-center gap-4 bg-secondary/10 border border-border/40 p-4 rounded-2xl">
        <StepIndicator step={1} current={currentStep} label="Audience Match" />
        <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
        <StepIndicator step={2} current={currentStep} label="AI co-pilot" />
        <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
        <StepIndicator step={3} current={currentStep} label="Review & Dispatch" />
      </div>

      {/* STEP 1: Audience Builder View */}
      {currentStep === 1 && (
        <div className="glass-card p-6 animate-fade-in space-y-6">
          <div className="flex items-center gap-2 border-b border-border/30 pb-4">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Step 1: Segment Query Builder
            </h2>
          </div>

          <AudienceBuilder
            rules={rules}
            setRules={setRules}
            audienceCount={audienceCount}
            checkingAudience={checkingAudience}
            onCheckAudience={handleCheckAudience}
          />

          {audienceCount !== null && sampleCustomers.length > 0 && (
            <AudiencePreview
              sampleCustomers={sampleCustomers}
              totalCount={audienceCount}
            />
          )}

          {audienceCount !== null && (
            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={audienceCount === 0}
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all flex items-center gap-1.5"
              >
                Proceed to Message Generation
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: AI Message Generation View (2-Column Grid) */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Prompt Entry Box (7 spans) */}
          <div className="lg:col-span-7 glass-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Step 2: AI Copywriter
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Back to Segment
              </Button>
            </div>

            <div className="space-y-4">
              {/* Intent input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Campaign Offer Intent
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="e.g. Offer 15% discount for customers who haven't ordered in 6 months"
                    className="flex-1 bg-secondary/35 border-border text-xs font-medium h-10 rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateMessage()}
                  />
                  <Button
                    onClick={handleGenerateMessage}
                    disabled={generatingMessage || !intent.trim()}
                    className="bg-[#6366f1] hover:bg-[#6366f1]/95 text-white font-bold text-xs px-5 h-10 rounded-xl whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-[#6366f1]/20"
                  >
                    {generatingMessage ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {generatingMessage ? "Writing..." : "Draft with Gemini"}
                  </Button>
                </div>
              </div>

              {/* Dynamic Guidelines Banner */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-primary leading-relaxed font-medium">
                  <p className="font-bold mb-1">Personalization Variables Available:</p>
                  You can include <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-bold text-[10px]">{`{name}`}</code>, <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-bold text-[10px]">{`{totalSpends}`}</code> or <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-bold text-[10px]">{`{visits}`}</code>. Gemini will automatically place them inside the drafted template text.
                </div>
              </div>

              {/* Editable Output */}
              {generatedMessage && !generatingMessage && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Edit Draft Template
                    </span>
                  </div>
                  <textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    rows={6}
                    className="w-full bg-secondary/20 border border-border/80 rounded-xl p-4 text-xs font-semibold text-foreground font-mono resize-none focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
              )}

              {generatedMessage && (
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    Proceed to Review
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Phone Frame (5 spans) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Live Device Mockup
            </p>
            
            <div className="w-[280px] phone-frame relative">
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
              </div>
              
              <div className="phone-screen h-[480px] pt-8 px-3 pb-4 flex flex-col justify-between">
                {/* Header Info */}
                <div className="bg-[#0b141a]/95 text-white text-[10px] p-2.5 rounded-2xl flex items-center gap-2 border border-white/5 shadow-md">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-[9px] font-extrabold">
                    X
                  </div>
                  <div>
                    <p className="font-bold text-[9px]">Xeno CRM Gateway</p>
                    <p className="text-[7px] text-emerald-400">Verified Business Account</p>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 flex flex-col justify-end space-y-2 py-4 overflow-y-auto">
                  {generatingMessage ? (
                    <div className="wa-bubble-out p-3 max-w-[85%] self-end">
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : generatedMessage ? (
                    <div className="wa-bubble-out p-3 text-[10px] font-medium leading-normal whitespace-pre-wrap">
                      {getMockupMessage(generatedMessage)}
                      <p className="text-[8px] text-neutral-500 text-right mt-1.5 font-bold">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground text-center px-4 leading-relaxed font-semibold italic">
                      Live preview updates as AI drafts template variants
                    </p>
                  )}
                </div>

                {/* Footer Input Bar */}
                <div className="bg-[#f0f2f5] p-1.5 rounded-2xl flex items-center gap-2 border border-neutral-300">
                  <div className="bg-white rounded-xl flex-1 px-3 py-1 text-[8px] text-neutral-400 font-bold border border-neutral-200">
                    Message...
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0 text-white text-[9px]">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Launch Campaign View */}
      {currentStep === 3 && (
        <div className="glass-card p-6 animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Step 3: Review & Dispatch
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Back to Editor
            </Button>
          </div>

          {launchResult ? (
            <div
              className={`p-6 rounded-2xl border ${
                launchResult.success
                  ? "bg-emerald-500/5 border-emerald-500/25"
                  : "bg-red-500/5 border-red-500/25"
              } animate-fade-in space-y-4`}
            >
              <div className="flex items-center gap-3">
                {launchResult.success ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 font-bold text-sm">!</span>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {launchResult.success ? "Campaign Handed Over to Gateway 🚀" : "Execution Halted"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                    {launchResult.success ? "Ingestion pipeline initialized" : "System exception"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {launchResult.message}
              </p>

              {launchResult.success && launchResult.campaignId && (
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Internal Tracker ID:</span>
                    <span className="font-mono font-bold text-primary">{launchResult.campaignId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link href="/analytics" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2 rounded-xl transition-all">
                        Monitor Live Ingestion Log
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        setLaunchResult(null);
                        setCampaignName("");
                        setIntent("");
                        setGeneratedMessage("");
                        setAudienceCount(null);
                        setSampleCustomers([]);
                        setCurrentStep(1);
                      }}
                      variant="outline"
                      className="border-border hover:bg-secondary text-xs font-bold py-2 px-5 rounded-xl transition-all"
                    >
                      Draft New Campaign
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campaign summary review card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-secondary/10 border border-border/40 p-5 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Campaign Name</p>
                  <p className="text-xs font-bold text-foreground mt-1.5">
                    {campaignName || "Untitled AI Campaign"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Matched Audience</p>
                  <p className="text-xs font-bold text-foreground mt-1.5">
                    {audienceCount?.toLocaleString()} shoppers in segment
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dispatch Channel</p>
                  <p className="text-xs font-bold text-foreground mt-1.5">
                    WhatsApp Cloud API (Simulated Gateway)
                  </p>
                </div>
              </div>

              {/* Form Input for naming campaign */}
              <div className="space-y-2 max-w-md">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Assign Campaign Name
                </label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Winter Sale Warm Segment v1"
                  className="bg-secondary/35 border-border text-xs font-medium h-10 rounded-xl"
                />
                <p className="text-[10px] text-muted-foreground">
                  Give the campaign a descriptive name to track its delivery metrics in the logs.
                </p>
              </div>

              {/* Message template review box */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message template text</p>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 text-xs font-semibold text-foreground font-mono leading-relaxed">
                  {generatedMessage}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button
                  onClick={handleLaunchCampaign}
                  disabled={launching || !campaignName.trim() || !generatedMessage}
                  className="bg-emerald-600 hover:bg-emerald-600/95 text-white font-bold text-xs py-2 px-6 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  {launching ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {launching ? "Sending batches..." : "Dispatch Campaign"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
