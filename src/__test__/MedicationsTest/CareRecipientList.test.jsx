import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CareRecipientList from '../../Medications/CareRecipientList/CareRecipientList';

const mockRecipients = [
    { id: 1, name: 'James Tan' },
    { id: 2, name: 'Amelia Tan' },
];

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}));


describe('CareRecipientList Component', () => {

    it('should render the names of all recipients', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                selectedRecipientId={1} 
            />
        );
        expect(screen.getByText('James Tan')).toBeInTheDocument();
        expect(screen.getByText('Amelia Tan')).toBeInTheDocument();
    });

    it('should show "Showing" for the selected recipient and "Switch" for others', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                selectedRecipientId={2} 
            />
        );
        
        const ameliaRow = screen.getByText('Amelia Tan').closest('.recipient-item');
        expect(ameliaRow.textContent).toContain('Showing');

        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        expect(jamesRow.textContent).toContain('Switch');
    });

    it('should call onSelect with the correct recipient when clicked', () => {
        const handleSelect = vi.fn();
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={handleSelect} 
                selectedRecipientId={1} 
            />
        );

        fireEvent.click(screen.getByText('Amelia Tan'));
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith(mockRecipients[1]);
    });

    it('should display the "Add Care Recipient" button when not in adding mode', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                isAdding={false} 
            />
        );
        expect(screen.getByText('Add Care Recipient')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("New Recipient's Name...")).not.toBeInTheDocument();
    });

    it('should display the inline form when isAdding is true', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                isAdding={true} 
            />
        );

        expect(screen.queryByText('Add Care Recipient')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText("New Recipient's Name...")).toBeInTheDocument();
    });

    it('should call onSaveNew when the save button is clicked', () => {
        const handleSave = vi.fn();
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                isAdding={true} 
                onSaveNew={handleSave}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));
        expect(handleSave).toHaveBeenCalledTimes(1);
    });
});