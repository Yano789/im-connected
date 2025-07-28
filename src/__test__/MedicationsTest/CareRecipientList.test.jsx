import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CareRecipientList from '../../Medications/CareRecipientList/CareRecipientList';

// Test Data 
const mockRecipients = [
    { id: '1', name: 'James Tan' },
    { id: '2', name: 'Amelia Tan' },
];

describe('CareRecipientList Component (New Version)', () => {

    it('should render the names of all recipients', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                selectedRecipientId={'1'} 
            />
        );
        expect(screen.getByText('James Tan')).toBeInTheDocument();
        expect(screen.getByText('Amelia Tan')).toBeInTheDocument();
    });

    it('should show "Showing" for the selected recipient', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={() => {}} 
                selectedRecipientId={'2'} // Amelia is selected
            />
        );
        
        const ameliaRow = screen.getByText('Amelia Tan').closest('.recipient-item');
        expect(ameliaRow.textContent).toContain('Showing');
    });

    it('should call onSelect with the correct ID when a recipient is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <CareRecipientList 
                recipients={mockRecipients} 
                onSelect={handleSelect} 
                selectedRecipientId={'1'} 
            />
        );

        fireEvent.click(screen.getByText('Amelia Tan'));
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith('2'); // Should be called with Amelia's ID
    });

    //  TEST for the delete button 
    it('should call onDelete with the correct ID when the delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(
            <CareRecipientList 
                recipients={mockRecipients}
                onDelete={handleDelete}
                onSelect={() => {}}
                selectedRecipientId={'1'}
            />
        );

        // Find the delete button within the row for "James Tan"
        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        const deleteButton = jamesRow.querySelector('.delete-recipient-button');
        
        // Simulate the user clicking the delete button
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleDelete).toHaveBeenCalledWith('1'); // Should be called with James Tan's ID
    });

    it('should display the inline form when isAdding is true', () => {
        render(
            <CareRecipientList 
                recipients={mockRecipients}
                isAdding={true} 
            />
        );
        expect(screen.getByPlaceholderText("New Recipient's Name...")).toBeInTheDocument();
    });
});