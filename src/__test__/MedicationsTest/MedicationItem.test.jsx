import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationItem from '../../Medications/MedicationItem/MedicationItem';

// Test Data
// Using the new data structure 
const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [
        { period: 'Morning', time: '10:00', taken: true },
        { period: 'Evening', time: '18:00', taken: false }
    ]
};

describe('MedicationItem Component (New Version)', () => {

    it('should render the medication name and formatted dosage times', () => {
        render(
            <MedicationItem 
                medication={mockMedication} 
                isSelected={false} 
                onSelect={() => {}} 
            />
        );

        expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        expect(screen.getByText('6:00 PM')).toBeInTheDocument();
    });

    it('should correctly check the checkboxes based on the "taken" property', () => {
        render(
            <MedicationItem 
                medication={mockMedication} 
                isSelected={false} 
                onSelect={() => {}} 
            />
        );
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0].checked).toBe(true);
        expect(checkboxes[1].checked).toBe(false);
    });


    it('should call onSelect with the medication ID when the name container is clicked', () => {
        const handleSelect = vi.fn(); // Create a spy function

        render(
            <MedicationItem 
                medication={mockMedication} 
                isSelected={false} 
                onSelect={handleSelect} 
            />
        );

        // In the new component, the whole name container is clickable
        fireEvent.click(screen.getByText('Metformin XR 500mg').closest('.med-name-container'));

        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith('med1');
    });

    it('should have the "selected" class when isSelected is true', () => {
        const { container } = render(
            <MedicationItem 
                medication={mockMedication} 
                isSelected={true} 
                onSelect={() => {}} 
            />
        );

        const layoutDiv = container.querySelector('.med-item-layout');
        expect(layoutDiv.classList.contains('selected')).toBe(true);
    });
});