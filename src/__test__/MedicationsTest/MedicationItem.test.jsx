import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicationItem from '../../Medications/MedicationItem/MedicationItem';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key === 'No time set' ? 'No time set' : key,
    }),
}));

// Test Data
const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [
        { time: '10:00', taken: true },
        { time: '18:00', taken: false },
        { time: '', taken: false } // Test empty time
    ]
};

const defaultProps = {
    medication: mockMedication,
    onSelect: vi.fn(),
    isSelected: false,
    onToggleDose: vi.fn(),
};

describe('MedicationItem Component (Updated Version)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the medication name', () => {
        render(<MedicationItem {...defaultProps} />);
        expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
    });

    it('should format times to 12-hour AM/PM format', () => {
        render(<MedicationItem {...defaultProps} />);
        
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        expect(screen.getByText('6:00 PM')).toBeInTheDocument();
    });

    it('should display "No time set" for empty time values', () => {
        render(<MedicationItem {...defaultProps} />);
        expect(screen.getByText('No time set')).toBeInTheDocument();
    });

    it('should render correct number of dosage rows', () => {
        render(<MedicationItem {...defaultProps} />);
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3); // Should match dosages array length
    });

    it('should correctly set checkbox states based on taken property', () => {
        render(<MedicationItem {...defaultProps} />);
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked(); // First dosage taken: true
        expect(checkboxes[1]).not.toBeChecked(); // Second dosage taken: false
        expect(checkboxes[2]).not.toBeChecked(); // Third dosage taken: false
    });

    it('should call onSelect with medication ID when name button is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <MedicationItem 
                {...defaultProps}
                onSelect={handleSelect}
            />
        );

        const nameButton = screen.getByText('Metformin XR 500mg');
        fireEvent.click(nameButton);

        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith('med1');
    });

    it('should call onToggleDose with correct parameters when checkbox is changed', () => {
        const handleToggleDose = vi.fn();
        render(
            <MedicationItem 
                {...defaultProps}
                onToggleDose={handleToggleDose}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        
        // Toggle first checkbox
        fireEvent.click(checkboxes[0]);
        expect(handleToggleDose).toHaveBeenCalledWith('med1', 0);
        
        // Toggle second checkbox
        fireEvent.click(checkboxes[1]);
        expect(handleToggleDose).toHaveBeenCalledWith('med1', 1);
        
        expect(handleToggleDose).toHaveBeenCalledTimes(2);
    });

    it('should apply selected class when isSelected is true', () => {
        const { container } = render(
            <MedicationItem 
                {...defaultProps}
                isSelected={true}
            />
        );

        const layoutDiv = container.querySelector('.med-item-layout');
        expect(layoutDiv).toHaveClass('selected');
    });

    it('should not apply selected class when isSelected is false', () => {
        const { container } = render(
            <MedicationItem 
                {...defaultProps}
                isSelected={false}
            />
        );

        const layoutDiv = container.querySelector('.med-item-layout');
        expect(layoutDiv).not.toHaveClass('selected');
    });

    it('should handle medication with no dosages', () => {
        const medicationWithNoDosages = {
            id: 'med2',
            name: 'Test Medicine',
            dosages: []
        };

        render(
            <MedicationItem 
                {...defaultProps}
                medication={medicationWithNoDosages}
            />
        );

        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });
});