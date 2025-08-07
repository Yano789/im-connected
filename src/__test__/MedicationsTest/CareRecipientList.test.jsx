import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CareRecipientList from '../../Medications/CareRecipientList/CareRecipientList';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key, // Return the key as the translation
    }),
}));

// Test Data 
const mockRecipients = [
    { id: '1', name: 'James Tan' },
    { id: '2', name: 'Amelia Tan' },
];

const defaultProps = {
    recipients: mockRecipients,
    onSelect: vi.fn(),
    selectedRecipientId: null,
    onDelete: vi.fn(),
    isAdding: false,
    onAdd: vi.fn(),
    onSaveNew: vi.fn(),
    newName: '',
    setNewName: vi.fn(),
};

describe('CareRecipientList Component (Updated Version)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the header and all recipient names', () => {
        render(<CareRecipientList {...defaultProps} />);
        
        expect(screen.getByText('My Care Recipients')).toBeInTheDocument();
        expect(screen.getByText('James Tan')).toBeInTheDocument();
        expect(screen.getByText('Amelia Tan')).toBeInTheDocument();
    });

    it('should show "Showing" button for the selected recipient and "Switch" for others', () => {
        render(
            <CareRecipientList 
                {...defaultProps}
                selectedRecipientId={'2'} // Amelia is selected
            />
        );
        
        // Amelia should show "Showing"
        const ameliaRow = screen.getByText('Amelia Tan').closest('.recipient-item');
        expect(ameliaRow).toHaveTextContent('Showing');
        
        // James should show "Switch"
        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        expect(jamesRow).toHaveTextContent('Switch');
    });

    it('should apply selected class to the selected recipient', () => {
        render(
            <CareRecipientList 
                {...defaultProps}
                selectedRecipientId={'1'}
            />
        );
        
        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        expect(jamesRow).toHaveClass('selected');
        
        const ameliaRow = screen.getByText('Amelia Tan').closest('.recipient-item');
        expect(ameliaRow).not.toHaveClass('selected');
    });

    it('should call onSelect with the correct ID when a recipient is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                onSelect={handleSelect}
            />
        );

        fireEvent.click(screen.getByText('Amelia Tan').closest('.recipient-item'));
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith('2');
    });

    it('should call onDelete with the correct ID when delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                onDelete={handleDelete}
            />
        );

        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        const deleteButton = jamesRow.querySelector('.delete-recipient-button');
        
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleDelete).toHaveBeenCalledWith('1');
    });

    it('should not call onSelect when delete button is clicked (event.stopPropagation)', () => {
        const handleSelect = vi.fn();
        const handleDelete = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                onSelect={handleSelect}
                onDelete={handleDelete}
            />
        );

        const jamesRow = screen.getByText('James Tan').closest('.recipient-item');
        const deleteButton = jamesRow.querySelector('.delete-recipient-button');
        
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleSelect).not.toHaveBeenCalled(); // Should not be called due to stopPropagation
    });

    it('should display the Add Care Recipient button when not adding', () => {
        render(<CareRecipientList {...defaultProps} />);
        expect(screen.getByText('Add Care Recipient')).toBeInTheDocument();
    });

    it('should call onAdd when Add Care Recipient button is clicked', () => {
        const handleAdd = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                onAdd={handleAdd}
            />
        );

        fireEvent.click(screen.getByText('Add Care Recipient'));
        expect(handleAdd).toHaveBeenCalledTimes(1);
    });

    it('should display the inline form when isAdding is true', () => {
        render(
            <CareRecipientList 
                {...defaultProps}
                isAdding={true}
                newName="Test Name"
            />
        );
        
        expect(screen.getByPlaceholderText("New Recipient's Name...")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should hide Add Care Recipient button when isAdding is true', () => {
        render(
            <CareRecipientList 
                {...defaultProps}
                isAdding={true}
            />
        );
        
        expect(screen.queryByText('Add Care Recipient')).not.toBeInTheDocument();
    });

    it('should call setNewName when input value changes', () => {
        const handleSetNewName = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                isAdding={true}
                setNewName={handleSetNewName}
            />
        );

        const input = screen.getByPlaceholderText("New Recipient's Name...");
        fireEvent.change(input, { target: { value: 'New Recipient' } });

        expect(handleSetNewName).toHaveBeenCalledWith('New Recipient');
    });

    it('should call onSaveNew when Save button is clicked', () => {
        const handleSaveNew = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                isAdding={true}
                onSaveNew={handleSaveNew}
            />
        );

        fireEvent.click(screen.getByText('Save'));
        expect(handleSaveNew).toHaveBeenCalledTimes(1);
    });

    it('should call onSaveNew when Enter key is pressed in input', () => {
        const handleSaveNew = vi.fn();
        render(
            <CareRecipientList 
                {...defaultProps}
                isAdding={true}
                onSaveNew={handleSaveNew}
            />
        );

        const input = screen.getByPlaceholderText("New Recipient's Name...");
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(handleSaveNew).toHaveBeenCalledTimes(1);
    });
});