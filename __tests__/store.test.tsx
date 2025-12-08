import { renderHook, act, waitFor } from '@testing-library/react';
import { StoreProvider, useStore } from '@/app/lib/app_store';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.Mock;

// Mock fetch
global.fetch = jest.fn();

describe('Store Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        // Default to unauthenticated to avoid simple cloud sync logic by default
        mockUseSession.mockReturnValue({
            data: null,
            status: "unauthenticated"
        });

        // Default fetch mock
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({})
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <StoreProvider>{children}</StoreProvider>
    );

    it('initializes with default categories', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });

        // Wait for isLoaded
        await waitFor(() => {
            expect(result.current.categories.length).toBeGreaterThan(0);
        });

        expect(result.current.categories).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "Tone" }),
            expect.objectContaining({ name: "Format" })
        ]));
    });

    it('adds a new category', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });

        await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

        act(() => {
            result.current.addCategory('New Cat');
        });

        expect(result.current.categories).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'New Cat' })
        ]));
    });

    it('adds a keyword to a category', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

        const targetCatId = result.current.categories[0].id;

        act(() => {
            result.current.addKeyword(targetCatId, 'New Keyword');
        });

        const updatedCat = result.current.categories.find(c => c.id === targetCatId);
        expect(updatedCat?.keywords).toEqual(expect.arrayContaining([
            expect.objectContaining({ text: 'New Keyword' })
        ]));
    });

    it('adds to history and maintains order', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.history).toBeDefined());

        act(() => {
            result.current.addToHistory('Prompt 1');
        });

        act(() => {
            result.current.addToHistory('Prompt 2');
        });

        expect(result.current.history).toHaveLength(2);
        // Newest first
        expect(result.current.history[0].text).toBe('Prompt 2');
        expect(result.current.history[1].text).toBe('Prompt 1');
    });

    it('clears history', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.history).toBeDefined());

        act(() => {
            result.current.addToHistory('Prompt 1');
        });

        expect(result.current.history).toHaveLength(1);

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.history).toHaveLength(0);
    });
});
