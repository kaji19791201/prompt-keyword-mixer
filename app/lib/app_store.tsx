"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Category, HistoryItem, StoreState } from "./types";
import { useSession } from "next-auth/react";

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
    const { data: session, status } = useSession();
    const [categories, setCategories] = useState<Category[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const [cloudSynced, setCloudSynced] = useState(false);

    // Initial load from Local Storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCategories(parsed);
                    setHistory([]);
                } else {
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

    // Cloud Sync: Load from server on login
    useEffect(() => {
        if (status === "authenticated" && isLoaded) {
            console.log("Fetching from cloud...");
            fetch("/api/sync")
                .then((res) => res.json())
                .then((data) => {
                    console.log("Cloud data received:", data);
                    // Simple strategy: If server has data, use it.
                    // Ideally we might prompt user to merge, but MVP uses server truth if exists.
                    if (data && (data.categories || data.history)) {
                        if (data.categories) setCategories(data.categories);
                        if (data.history) setHistory(data.history);
                    }
                })
                .catch((err) => console.error("Failed to sync from cloud", err))
                .finally(() => {
                    setCloudSynced(true);
                    console.log("Cloud sync initialization complete");
                });
        } else if (status === "unauthenticated") {
            setCloudSynced(false);
        }
    }, [status, isLoaded]);

    // Save to Local Cloud & Local Storage
    const saveData = useCallback(
        (newCategories: Category[], newHistory: HistoryItem[]) => {
            const dataToSave: StoredData = { categories: newCategories, history: newHistory };

            // 1. Local Persistence
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

            // 2. Cloud Persistence
            // Only save if authenticated AND we have finished the initial download (cloudSynced)
            // This prevents overwriting server data with local data immediately upon login
            if (status === "authenticated" && cloudSynced) {
                console.log("Saving to cloud...", dataToSave);
                fetch("/api/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSave),
                }).catch(err => console.error("Cloud save failed", err));
            }
        },
        [status, cloudSynced]
    );

    // Effect to trigger save when state changes
    useEffect(() => {
        if (isLoaded) {
            saveData(categories, history);
        }
    }, [categories, history, isLoaded, saveData]);


    const addCategory = (name: string) => {
        setCategories((prev) => [...prev, { id: crypto.randomUUID(), name, keywords: [] }]);
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
        const newItem: HistoryItem = { id: crypto.randomUUID(), text, timestamp: Date.now() };
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
