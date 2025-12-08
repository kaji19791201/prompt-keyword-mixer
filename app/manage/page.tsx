"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check, Cloud, Github } from "lucide-react";
import { useStore } from "@/app/lib/app_store";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default function ManagePage() {
    const { categories, addCategory, deleteCategory, updateCategory, addKeyword, deleteKeyword, updateKeyword } = useStore();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newKeywordText, setNewKeywordText] = useState<{ [key: string]: string }>({});
    const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
    const [editingKeyword, setEditingKeyword] = useState<{ categoryId: string, keywordId: string, text: string } | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addCategory(newCategoryName);
        setNewCategoryName("");
    };

    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.name.trim()) {
            updateCategory(editingCategory.id, editingCategory.name);
            setEditingCategory(null);
        }
    };

    const handleCreateKeyword = (categoryId: string) => {
        const text = newKeywordText[categoryId];
        if (!text?.trim()) return;
        addKeyword(categoryId, text);
        setNewKeywordText(prev => ({ ...prev, [categoryId]: "" }));
    };

    const handleUpdateKeyword = () => {
        if (editingKeyword && editingKeyword.text.trim()) {
            updateKeyword(editingKeyword.categoryId, editingKeyword.keywordId, editingKeyword.text);
            setEditingKeyword(null);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Keywords</h1>
            </div>

            <CloudConfig />

            {/* Add New Category */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
                <Input
                    placeholder="New Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </form>

            <div className="space-y-4">
                {categories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader className="bg-slate-50 py-2 px-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                            {editingCategory?.id === category.id ? (
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                    <Input
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="h-8"
                                        autoFocus
                                    />
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleUpdateCategory}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => setEditingCategory(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between flex-1">
                                    <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                                    <div className="flex gap-1">
                                        {deleteConfirmation === category.id ? (
                                            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                                                <span className="text-xs text-red-600 font-medium mr-1">Delete?</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCategory(category.id);
                                                        setDeleteConfirmation(null);
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmation(null);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                                                    onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDeleteConfirmation(category.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {category.keywords.map((keyword) => (
                                    editingKeyword?.keywordId === keyword.id ? (
                                        <div key={keyword.id} className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
                                            <Input
                                                value={editingKeyword.text}
                                                onChange={(e) => setEditingKeyword({ ...editingKeyword, text: e.target.value })}
                                                className="h-8 text-base w-32"
                                                autoFocus
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleUpdateKeyword}>
                                                <Check className="h-5 w-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => setEditingKeyword(null)}>
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div key={keyword.id} className="group flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full pl-4 pr-1 py-1 transition-colors hover:bg-slate-50">
                                            <span className="text-sm font-medium text-slate-700 py-1">{keyword.text}</span>
                                            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1 ml-1">
                                                <button
                                                    onClick={() => setEditingKeyword({ categoryId: category.id, keywordId: keyword.id, text: keyword.text })}
                                                    className="p-2 text-slate-400 hover:text-slate-900 focus:text-slate-900 active:scale-95 transition-transform"
                                                    aria-label={`Edit ${keyword.text}`}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteKeyword(category.id, keyword.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 focus:text-red-600 active:scale-95 transition-transform"
                                                    aria-label={`Delete ${keyword.text}`}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add keyword..."
                                    value={newKeywordText[category.id] || ""}
                                    onChange={(e) => setNewKeywordText(prev => ({ ...prev, [category.id]: e.target.value }))}
                                    className="h-8 text-base"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateKeyword(category.id);
                                        }
                                    }}
                                />
                                <Button size="sm" variant="secondary" onClick={() => handleCreateKeyword(category.id)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

const CloudConfig = () => {
    const { data: session } = useSession();

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 py-3 px-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Cloud Sync</h3>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {session ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || ""}
                                    className="h-8 w-8 rounded-full border border-slate-200"
                                />
                            )}
                            <div className="text-sm">
                                <p className="font-medium text-slate-900">{session.user?.name}</p>
                                <p className="text-xs text-slate-500">Sync is active</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => signOut()}
                        >
                            Log out
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-slate-600">
                            Sign in to sync your keywords and history across devices.
                        </p>
                        <Button
                            variant="default"
                            className="w-full bg-slate-900 hover:bg-slate-800"
                            onClick={() => signIn("github")}
                        >
                            <Github className="h-4 w-4 mr-2" />
                            Sign in with GitHub
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
