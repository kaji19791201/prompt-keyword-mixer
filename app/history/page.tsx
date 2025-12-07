"use client";

import { useState } from "react";
import { useStore } from "@/app/lib/app_store";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { Trash2, Copy, CheckCircle2 } from "lucide-react";

export default function HistoryPage() {
    const { history, deleteHistory, clearHistory } = useStore();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">History</h1>
                {history.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (confirm("Clear all history?")) {
                                clearHistory();
                            }
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {history.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No history yet. Generate and copy some prompts!
                    </div>
                )}
                {history.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50/50 py-2 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">
                                {formatDate(item.timestamp)}
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-slate-400 hover:text-red-500"
                                    onClick={() => deleteHistory(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="relative">
                                <p className="text-sm text-slate-700 pr-8 break-words leading-relaxed">
                                    {item.text}
                                </p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute -top-1 -right-1 h-8 w-8 text-slate-400 hover:text-slate-900"
                                    onClick={() => handleCopy(item.id, item.text)}
                                >
                                    {copiedId === item.id ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
