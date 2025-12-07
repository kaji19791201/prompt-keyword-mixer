"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, HistoryItem, StoreState } from "./types";

const STORAGE_KEY = "prompt-keyword-mixer-data";

const defaultCategories: Category[] = [
    {
        id: "1",
        name: "Tone",
        keywords: [
            { id: "k1", text: "Professional" },
            { id: "k2", text: "Casual" },
            { id: "k3", text: "Friendly" },
        ],
    },
    {
        id: "2",
        name: "Format",
        keywords: [
            { id: "k4", text: "List" },
            { id: "k5", text: "Table" },
            { id: "k6", text: "Summary" },
        ],
    },
];

type StoredData = {
    categories: Category[];
    history: HistoryItem[];
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Migration logic: Check if it's the old array format
                if (Array.isArray(parsed)) {
                    setCategories(parsed);
                    setHistory([]);
                } else {
                    // New object format
                    setCategories(parsed.categories || defaultCategories);
                    setHistory(parsed.history || []);
                }
            } catch (e) {
                console.error("Failed to parse stored data", e);
                setCategories(defaultCategories);
                setHistory([]);
            }
        } else {
            setCategories(defaultCategories);
            setHistory([]);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const dataToSave: StoredData = { categories, history };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
    }, [categories, history, isLoaded]);

    const addCategory = (name: string) => {
        const newCategory = { id: crypto.randomUUID(), name, keywords: [] };
        setCategories((prev) => [...prev, newCategory]);
    };

    const updateCategory = (id: string, name: string) => {
        setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name } : cat)));
    };

    const deleteCategory = (id: string) => {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
    };

    const addKeyword = (categoryId: string, text: string) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, keywords: [...cat.keywords, { id: crypto.randomUUID(), text }] }
                    : cat
            )
        );
    };

    const updateKeyword = (categoryId: string, keywordId: string, text: string) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        keywords: cat.keywords.map((k) => (k.id === keywordId ? { ...k, text } : k)),
                    }
                    : cat
            )
        );
    };

    const deleteKeyword = (categoryId: string, keywordId: string) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        keywords: cat.keywords.filter((k) => k.id !== keywordId),
                    }
                    : cat
            )
        );
    };

    const addToHistory = (text: string) => {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            text,
            timestamp: Date.now(),
        };
        // Add to beginning of array
        setHistory((prev) => [newItem, ...prev]);
    };

    const deleteHistory = (id: string) => {
        setHistory((prev) => prev.filter((item) => item.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const storeValue = {
        categories,
        history,
        addCategory,
        updateCategory,
        deleteCategory,
        addKeyword,
        updateKeyword,
        deleteKeyword,
        addToHistory,
        deleteHistory,
        clearHistory,
    };

    if (!isLoaded) return null;

    return <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}
