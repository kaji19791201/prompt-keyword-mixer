import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ManagePage from '@/app/manage/page';
import { StoreProvider } from '@/app/lib/app_store';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.Mock;

// Mock fetch
global.fetch = jest.fn();

describe('Manage Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => ({}) });
    });

    const renderManage = () => {
        return render(
            <StoreProvider>
                <ManagePage />
            </StoreProvider>
        );
    };

    it('renders default categories', async () => {
        renderManage();
        await waitFor(() => {
            expect(screen.getByText('Manage Keywords')).toBeInTheDocument();
            expect(screen.getByText('Tone')).toBeInTheDocument();
            expect(screen.getByText('Format')).toBeInTheDocument();
        });
    });

    it('adds a new category', async () => {
        renderManage();
        await waitFor(() => screen.getByText('Tone'));

        const input = screen.getByPlaceholderText('New Category Name');
        const submitBtn = input.nextElementSibling as HTMLElement;
        // Or find button by type submit or icon if logic allows. 
        // The form is className="flex gap-2" inside ManagePage.
        // It's the only direct "form" likely, or we look for button with Plus icon.
        // Let's use getByPlaceholderText and closest form or sibling.

        fireEvent.change(input, { target: { value: 'My New Category' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('My New Category')).toBeInTheDocument();
        });
    });

    it('adds a new keyword to a category', async () => {
        renderManage();
        await waitFor(() => screen.getByText('Tone'));

        // Find the "Tone" card
        const toneCardHeading = screen.getByText('Tone').closest('.rounded-lg');
        // Actually .closest might be on the header, the card itself is parent.
        // Let's assume we can find the input inside the card that contains "Tone".
        // A better way: find the card by text, then within that card finding inputs.

        // Let's use visible text mapping. 
        // We can search for the "Tone" text, go up to the card container.
        // Then query within that container.

        // Note: The UI has `Card` component. 
        // Let's try `screen.getByText('Tone')` and traversing up.
        // Or cleaner: `within` logic if we had distinct test-ids.
        // For now, we know "Tone" is unique as a header.

        // Alternatively, since "Tone" is standard, we can just find *any* placeholder "Add keyword..." and rely on structure. 
        // But there are multiple.

        // Let's assume the first "Add keyword..." input corresponds to the first category (Tone, usually).
        const inputs = screen.getAllByPlaceholderText('Add keyword...');
        const toneInput = inputs[0]; // First one
        const toneAddBtn = toneInput.nextElementSibling as HTMLElement;

        fireEvent.change(toneInput, { target: { value: 'Spicy' } });
        fireEvent.click(toneAddBtn);

        await waitFor(() => {
            expect(screen.getByText('Spicy')).toBeInTheDocument();
        });
    });

    it('deletes a category with confirmation', async () => {
        renderManage();
        await waitFor(() => screen.getByText('Tone'));

        // Targeted category: Format (second one) to minimize scroll/focus issues or just pick one.
        // Let's delete "Tone" (first one).

        // There are multiple Trash icons.
        // We need the trash icon inside the Tone card header.
        // Structure: CardHeader > div > div > Button > Trash2

        // Let's find "Tone", traverse to its container header, find the trash button.
        // `Tone` is inside `CardTitle`. Sibling div contains the buttons.

        // Simpler: getAllByRole('button') and filtering is hard.
        // Let's try finding the delete button by knowing the category.

        // We can interact with "Tone" text.
        // const toneText = screen.getByText('Tone');
        // const cardHeader = toneText.closest('.bg-slate-50'); 
        // const deleteBtn = within(cardHeader).getByRole('button', { name: '' }) ... icons usually don't have names unless proper aria.

        // We didn't add aria-labels to Edit/Delete buttons in ManagePage yet. 
        // This is a good opportunity to fix Accessibility too if tests fail.

        // Assuming we haven't fixed A11y yet, let's try finding by class or structure logic in test if desperate, 
        // BUT better practice is to add aria-labels now or use querySelector.

        // The code has: <Button ...><Trash2 .../></Button>
        // No aria-label.

        // Let's add aria-labels to the code FIRST via a separate tool call if needed?
        // Or blindly try to find use `container.querySelector` in the test.

        // Strategy: Render, then find the specific delete button using DOM traversal that mimics user finding "The trash can next to Tone".

        const toneHeading = screen.getByText('Tone');
        const cardHeader = toneHeading.closest('div.flex-row'); // The CardHeader has these classes
        // Actually CardHeader has `flex flex-row ...`

        // Inside cardHeader, there is a button with Trash icon.
        // Since we can't easily select by icon, let's select all buttons in this header.
        // There should be Edit and Delete (and maybe others if editing).
        // By default: Edit, Delete.

        if (!cardHeader) throw new Error("Card header not found");

        const buttons = within(cardHeader as HTMLElement).getAllByRole('button');
        // Standard buttons: Edit (pencil), Delete (trash).
        // Edit is usually first? 
        // Code: Edit button then Delete button.
        const deleteBtn = buttons[1];

        // 1. Click delete (Request confirmation)
        fireEvent.click(deleteBtn);

        // 2. Check for "Delete?" text appearing
        await waitFor(() => {
            expect(screen.getByText('Delete?')).toBeInTheDocument();
        });

        // 3. Confirm delete (The Check button appears)
        const confirmBtn = screen.getAllByRole('button')[0];
        // Wait, getting ALL buttons is risky.
        // The confirmation UI replaces the Edit/Delete buttons with "Delete? Checl(Confirm) X(Cancel)".
        // So inside cardHeader, we should look for the new buttons.

        const confirmButtons = within(cardHeader as HTMLElement).getAllByRole('button');
        // Based on code: span(Delete?), Button(Check), Button(X)
        const checkBtn = confirmButtons[0]; // First button is Check

        fireEvent.click(checkBtn);

        // 4. Verify Tone is gone
        await waitFor(() => {
            expect(screen.queryByText('Tone')).not.toBeInTheDocument();
        });
    });
});
