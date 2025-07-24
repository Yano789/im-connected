import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MedicationItem from '../../Medications/MedicationItem/MedicationItem';

const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [
        { period: 'Morning', time: '10:00', taken: true },
        { period: 'Evening', time: '18:00', taken: false }
    ],
    usedTo: 'Manages Type 2 Diabetes Mellitus.',
    sideEffects: 'May cause Drowsiness',
    image: 'test_image_url.jpg'
};

describe('MedicationItem Component', () => {

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

    it('should call the onSelect function when the name container is clicked', () => {
        const handleSelect = vi.fn(); 

        render(
            <MedicationItem 
                medication={mockMedication} 
                isSelected={false} 
                onSelect={handleSelect} 
            />
        );

        fireEvent.click(screen.getByText('Metformin XR 500mg'));

        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith(mockMedication);
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