"use client";

import { useState } from "react";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { useStore } from "@/app/lib/app_store";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/button";

export default function Home() {
  const { categories } = useStore();
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleKeyword = (keywordText: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keywordText)) {
      newSelected.delete(keywordText);
    } else {
      newSelected.add(keywordText);
    }
    setSelectedKeywords(newSelected);
  };

  const getGeneratedPrompt = () => {
    // Determine order based on categories order? Or selection order?
    // Requirement says "Combine keywords". Usually category order makes sense for structure.
    // We will iterate categories and pick selected keywords to maintain structure.

    let parts: string[] = [];
    categories.forEach(cat => {
      cat.keywords.forEach(k => {
        if (selectedKeywords.has(k.text)) {
          parts.push(k.text);
        }
      });
    });

    // Fallback: If keywords were deleted but still in selection state (unlikely with this logic, but good for robustness if we stored IDs)
    // Actually we store text for simplicity in display, but better to store IDs?
    // The requirement says "Combine keywords". Storing text strings is fine for MVP.
    // If we wanted to respect selection order regardless of category, we would need a different selection state structure (array).
    // Let's stick to Category Order for structured prompts (e.g. Tone first, then Format)

    return parts.join(", "); // or space, or newline. Comma is safer for generic lists.
  };

  const GeneratedPrompt = getGeneratedPrompt();

  const handleCopy = async () => {
    if (!GeneratedPrompt) return;
    try {
      await navigator.clipboard.writeText(GeneratedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const clearSelection = () => {
    setSelectedKeywords(new Set());
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prompt Mixer</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          disabled={selectedKeywords.size === 0}
          className="text-slate-500 hover:text-red-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50/50 py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {category.keywords.map((keyword) => {
                  const isSelected = selectedKeywords.has(keyword.text);
                  return (
                    <button
                      key={keyword.id}
                      onClick={() => toggleKeyword(keyword.text)}
                      className={cn(
                        "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-md active:scale-95"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                      )}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                      {keyword.text}
                    </button>
                  );
                })}
                {category.keywords.length === 0 && (
                  <span className="text-sm text-slate-400 italic">No keywords available</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            Go to Manage tab to add categories and keywords.
          </div>
        )}
      </div>

      {/* Floating Bottom Bar for Result */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-10">
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative">
            <textarea
              readOnly
              value={GeneratedPrompt}
              placeholder="Select keywords to generate prompt..."
              className="w-full h-20 pl-3 pr-12 py-2 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
            />
            <div className="absolute top-2 right-2">
              <Button
                size="icon"
                className={cn(
                  "h-8 w-8 transition-all duration-300",
                  copied ? "bg-green-500 hover:bg-green-600" : "bg-slate-900 hover:bg-slate-800"
                )}
                onClick={handleCopy}
                disabled={!GeneratedPrompt}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
