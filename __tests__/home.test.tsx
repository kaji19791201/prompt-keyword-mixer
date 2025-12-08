import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { StoreProvider } from '@/app/lib/app_store';
import { useSession } from 'next-auth/react';
import userEvent from '@testing-library/user-event';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.Mock;

// Mock fetch for StoreProvider
global.fetch = jest.fn();

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: mockWriteText,
    },
});

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => ({}) });
    });

    const renderHome = () => {
        return render(
            <StoreProvider>
                <HomePage />
            </StoreProvider>
        );
    };

    it('renders default categories', async () => {
        renderHome();

        // Wait for store load
        await waitFor(() => {
            expect(screen.getByText('Tone')).toBeInTheDocument();
            expect(screen.getByText('Format')).toBeInTheDocument();
        });
    });

    it('generates prompt when keywords are selected', async () => {
        renderHome();
        await waitFor(() => screen.getByText('Tone'));

        // Find keywords. Default Tone has "Professional"
        const keywordBtn = screen.getByText('Professional');

        // Click keyword
        fireEvent.click(keywordBtn);

        // Check textarea
        const textarea = screen.getByPlaceholderText('Select keywords to generate prompt...');
        expect(textarea).toHaveValue('Professional');
    });

    it('copies generated prompt to clipboard and history', async () => {
        renderHome();
        await waitFor(() => screen.getByText('Tone'));

        // Select a keyword
        fireEvent.click(screen.getByText('Professional'));

        // Find copy button by aria-label
        const copyBtn = screen.getByRole('button', { name: /copy prompt/i });

        // Click copy
        fireEvent.click(copyBtn);

        // Verify clipboard
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Professional');

        // Verify UI feedback - Aria label should change to "Copied" or check icon present
        await waitFor(() => {
            const copiedBtn = screen.getByRole('button', { name: /copied/i });
            expect(copiedBtn).toBeInTheDocument();
        });
    });
});
