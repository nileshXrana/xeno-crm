"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AudienceBuilder from "@/components/AudienceBuilder";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

type Step = 1 | 2 | 3;

function StepIndicator({ step, current }: { step: Step; current: Step }) {
  const isComplete = current > step;
  const isActive = current === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          isComplete
            ? "bg-primary text-primary-foreground"
            : isActive
            ? "bg-primary/20 text-primary border-2 border-primary"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {step === 1 && "Define Audience"}
        {step === 2 && "Generate Message"}
        {step === 3 && "Launch Campaign"}
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

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Build audience segments, generate AI messages, and launch
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <StepIndicator step={1} current={currentStep} />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <StepIndicator step={2} current={currentStep} />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <StepIndicator step={3} current={currentStep} />
      </div>

      {/* Step 1: Audience Builder */}
      <div className={`glass-card p-6 mb-4 ${currentStep !== 1 ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Step 1: Define Your Audience
            </h2>
          </div>
          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
          )}
        </div>

        <AudienceBuilder
          rules={rules}
          setRules={setRules}
          audienceCount={audienceCount}
          checkingAudience={checkingAudience}
          onCheckAudience={handleCheckAudience}
        />

        {audienceCount !== null && currentStep === 1 && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={audienceCount === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue to Message
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: AI Message Generation */}
      {currentStep >= 2 && (
        <div className={`glass-card p-6 mb-4 ${currentStep !== 2 ? "opacity-70" : ""} animate-fade-in`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">
                Step 2: AI Message Generation
              </h2>
            </div>
            {currentStep > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Intent input */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Campaign Intent
              </label>
              <div className="flex gap-2">
                <Input
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="e.g. Offer 10% off on new winter collection"
                  className="flex-1 bg-secondary border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateMessage()}
                />
                <Button
                  onClick={handleGenerateMessage}
                  disabled={generatingMessage || !intent.trim()}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap"
                >
                  {generatingMessage ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {generatingMessage ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Describe your campaign goal — Gemini AI will craft a personalized WhatsApp message.
              </p>
            </div>

            {/* Generated message preview */}
            {generatingMessage && (
              <div className="h-32 skeleton rounded-xl" />
            )}

            {generatedMessage && !generatingMessage && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    Generated WhatsApp Message
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    rows={8}
                    className="w-full bg-secondary/80 border border-border rounded-xl p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      editable
                    </span>
                  </div>
                </div>
              </div>
            )}

            {generatedMessage && currentStep === 2 && (
              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue to Launch
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Launch Campaign */}
      {currentStep >= 3 && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Step 3: Launch Campaign
            </h2>
          </div>

          {launchResult ? (
            <div
              className={`p-5 rounded-xl border ${
                launchResult.success
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-destructive/10 border-destructive/30"
              } animate-fade-in`}
            >
              <div className="flex items-center gap-2 mb-2">
                {launchResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <span className="text-destructive">❌</span>
                )}
                <p className="text-sm font-semibold text-foreground">
                  {launchResult.success ? "Campaign Launched! 🚀" : "Launch Failed"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {launchResult.message}
              </p>
              {launchResult.success && launchResult.campaignId && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Campaign ID:{" "}
                    <span className="text-primary font-mono">
                      {launchResult.campaignId}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    📊 Check delivery status in the{" "}
                    <a href="/analytics" className="text-primary hover:underline">
                      Analytics page
                    </a>
                    .
                  </p>
                </div>
              )}
              {launchResult.success && (
                <Button
                  onClick={() => {
                    setLaunchResult(null);
                    setCampaignName("");
                    setGeneratedMessage("");
                    setIntent("");
                    setAudienceCount(null);
                    setCurrentStep(1);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-border hover:bg-secondary"
                >
                  Create Another Campaign
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Campaign summary */}
              <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Campaign Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audience Size</span>
                  <span className="text-primary font-bold">
                    {audienceCount ?? 0} customers
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="text-foreground">WhatsApp</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rules</span>
                  <span className="text-foreground">{rules.length} condition(s)</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Campaign Name *
                </label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Winter Sale 2025 – High Spenders"
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                onClick={handleLaunchCampaign}
                disabled={launching || !campaignName.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow"
              >
                {launching ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {launching ? "Launching..." : `Launch Campaign to ${audienceCount ?? 0} Customers`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
