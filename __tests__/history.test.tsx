import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import HistoryPage from '@/app/history/page';
import { StoreProvider, useStore } from '@/app/lib/app_store';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.Mock;

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    },
});

describe('History Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => ({}) });
    });

    const TestApp = () => {
        const { addToHistory } = useStore();
        return (
            <div>
                <button data-testid="seed-btn" onClick={() => {
                    addToHistory('Prompt 1');
                    addToHistory('Prompt 2');
                }}>Seed Data</button>
                <HistoryPage />
            </div>
        );
    };

    const renderWithStore = () => {
        return render(
            <StoreProvider>
                <TestApp />
            </StoreProvider>
        );
    };

    it('renders empty state initially', async () => {
        render(
            <StoreProvider>
                <HistoryPage />
            </StoreProvider>
        );
        await waitFor(() => {
            expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
        });
    });

    it('renders history items', async () => {
        renderWithStore();
        // Seed data
        fireEvent.click(screen.getByTestId('seed-btn'));

        await waitFor(() => {
            expect(screen.getByText('Prompt 1')).toBeInTheDocument();
            expect(screen.getByText('Prompt 2')).toBeInTheDocument();
        });

        // Should NOT show "No history yet"
        expect(screen.queryByText(/No history yet/i)).not.toBeInTheDocument();
    });

    it('clears all history with confirmation', async () => {
        renderWithStore();
        fireEvent.click(screen.getByTestId('seed-btn'));
        await waitFor(() => screen.getByText('Prompt 1'));

        // Find "Clear All" button
        const clearAllBtn = screen.getByText('Clear All');
        fireEvent.click(clearAllBtn);

        // Check for confirmation text
        await waitFor(() => {
            expect(screen.getByText('Delete All?')).toBeInTheDocument();
        });

        // Click "Yes, Clear"
        const confirmBtn = screen.getByText('Yes, Clear');
        fireEvent.click(confirmBtn);

        // Verify empty state
        await waitFor(() => {
            expect(screen.queryByText('Prompt 1')).not.toBeInTheDocument();
            expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
        });
    });

    it('deletes individual item immediately (no confirmation)', async () => {
        renderWithStore();
        fireEvent.click(screen.getByTestId('seed-btn'));
        await waitFor(() => screen.getByText('Prompt 1'));

        // Find the specific card for "Prompt 1"
        // Prompt 1 text is in a <p>.
        // The delete button is in the card header.

        // Structure: Card > Header(timestamp, deleteBtn) > Content(text, copyBtn)
        // We can find the text 'Prompt 1', go up to Card, then find delete button in Header.

        // Let's assume Prompt 1 is rendered.
        // We can look for buttons with Trash icon near it? No.

        // Simpler: Just click the *first* delete button in the list.
        // There are `deleteHistory` buttons and `clearAll` button (which has text).
        // The individual delete buttons only have an icon (Trash2).

        // In HistoryPage:
        // Clear All button has text "Clear All".
        // Item delete buttons have NO text, just <Trash2>.

        // So we can find buttons that satisfy some condition.
        // Or find the <Card> containing 'Prompt 1'?

        // Let's act on the Card container.
        // "Prompt 1" is in a Card.
        // Find element by text 'Prompt 1'.
        // Closest('.rounded-lg') is the card.
        // Within card, find button that is NOT the copy button.
        // Copy button is absolute positioned or has Copy/Check icon.
        // Delete button is in header.

        // Rely purely on structure:
        // There is one button in Header.

        const prompt1 = screen.getByText('Prompt 1');
        const card = prompt1.closest('.rounded-lg');

        if (!card) throw new Error("Card not found");

        // The header is the first child usually, or find by class bg-slate-50/50.
        const header = card.querySelector('.bg-slate-50\\/50'); // escaping slash for selector

        if (!header) throw new Error("Header not found");

        const deleteBtn = within(header as HTMLElement).getByRole('button');

        fireEvent.click(deleteBtn);

        // Check it is gone
        await waitFor(() => {
            expect(screen.queryByText('Prompt 1')).not.toBeInTheDocument();
            expect(screen.getByText('Prompt 2')).toBeInTheDocument(); // Prompt 2 remains
        });
    });
});
