export type Keyword = {
    id: string;
    text: string;
};

export type Category = {
    id: string;
    name: string;
    keywords: Keyword[];
};

export type HistoryItem = {
    id: string;
    text: string;
    timestamp: number;
};

export type StoreState = {
    categories: Category[];
    history: HistoryItem[];
    addCategory: (name: string) => void;
    updateCategory: (id: string, name: string) => void;
    deleteCategory: (id: string) => void;
    addKeyword: (categoryId: string, text: string) => void;
    updateKeyword: (categoryId: string, keywordId: string, text: string) => void;
    deleteKeyword: (categoryId: string, keywordId: string) => void;
    addToHistory: (text: string) => void;
    deleteHistory: (id: string) => void;
    clearHistory: () => void;
};
