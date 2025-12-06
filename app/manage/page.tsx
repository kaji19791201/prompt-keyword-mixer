"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { useStore } from "@/app/lib/app_store";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default function ManagePage() {
    const { categories, addCategory, updateCategory, deleteCategory, addKeyword, deleteKeyword } = useStore();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
    const [newKeywordInputs, setNewKeywordInputs] = useState<Record<string, string>>({});

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addCategory(newCategoryName);
        setNewCategoryName("");
    };

    const handleUpdateCategory = (id: string) => {
        if (editingCategory && editingCategory.name.trim()) {
            updateCategory(id, editingCategory.name);
            setEditingCategory(null);
        }
    };

    const handleAddKeyword = (categoryId: string) => {
        const text = newKeywordInputs[categoryId];
        if (text && text.trim()) {
            addKeyword(categoryId, text);
            setNewKeywordInputs((prev) => ({ ...prev, [categoryId]: "" }));
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Keywords</h1>
            </div>

            {/* Add New Category */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
                <Input
                    placeholder="New Category Name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button type="submit" disabled={!newCategoryName.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                </Button>
            </form>

            {/* Category List */}
            <div className="space-y-4">
                {categories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                {editingCategory?.id === category.id ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2">
                                        <Input
                                            value={editingCategory.name}
                                            onChange={(e) =>
                                                setEditingCategory({ ...editingCategory, name: e.target.value })
                                            }
                                            className="h-8"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-green-600"
                                            onClick={() => handleUpdateCategory(category.id)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-500"
                                            onClick={() => setEditingCategory(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {category.name}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-slate-400 hover:text-slate-900"
                                            onClick={() =>
                                                setEditingCategory({ id: category.id, name: category.name })
                                            }
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </CardTitle>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm(`Delete category "${category.name}"?`)) {
                                            deleteCategory(category.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {category.keywords.map((keyword) => (
                                    <Badge
                                        key={keyword.id}
                                        variant="secondary"
                                        className="flex items-center gap-1 pr-1"
                                    >
                                        {keyword.text}
                                        <button
                                            onClick={() => deleteKeyword(category.id, keyword.id)}
                                            className="ml-1 rounded-full p-0.5 hover:bg-slate-200 text-slate-400 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {category.keywords.length === 0 && (
                                    <span className="text-sm text-slate-400 italic">No keywords</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add keyword..."
                                    value={newKeywordInputs[category.id] || ""}
                                    onChange={(e) =>
                                        setNewKeywordInputs((prev) => ({
                                            ...prev,
                                            [category.id]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddKeyword(category.id);
                                        }
                                    }}
                                    className="h-8 text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleAddKeyword(category.id)}
                                    disabled={!newKeywordInputs[category.id]?.trim()}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {categories.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No categories yet. Add one above!
                    </div>
                )}
            </div>
        </div>
    );
}
