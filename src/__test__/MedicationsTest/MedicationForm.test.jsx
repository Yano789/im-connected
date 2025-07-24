import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationForm from '../../Medications/MedicationForm/MedicationForm';

const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [{ period: 'Morning', time: '10:00', taken: true }],
    usedTo: 'Manages Type 2 Diabetes Mellitus.',
    sideEffects: 'May cause Drowsiness',
    image: 'test_image_url.jpg'
};

describe('MedicationForm Component', () => {

    it('should display existing medication data when in edit mode', () => {
        render(
            <MedicationForm 
                medication={mockMedication}
                onSave={() => {}}
                onCancel={() => {}}
                onDelete={() => {}}
            />
        );
        expect(screen.getByLabelText('Medication Name')).toHaveValue('Metformin XR 500mg');
        expect(screen.getByLabelText('Used to treat')).toHaveValue('Manages Type 2 Diabetes Mellitus.');
        expect(screen.getByLabelText('Side Effects')).toHaveValue('May cause Drowsiness');
        expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should display an empty form when in add new mode', () => {
        render(
            <MedicationForm 
                medication={null}
                onSave={() => {}}
                onCancel={() => {}}
                onDelete={() => {}}
            />
        );
        expect(screen.getByLabelText('Medication Name')).toHaveValue('');
        expect(screen.getByLabelText('Used to treat')).toHaveValue('');
        expect(screen.getByLabelText('Side Effects')).toHaveValue('');
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should call onSave with the form data when submitted', () => {
        const handleSave = vi.fn();
        render(<MedicationForm medication={mockMedication} onSave={handleSave} onCancel={() => {}} onDelete={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /Save Medicine/i }));
        expect(handleSave).toHaveBeenCalledTimes(1);
        expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Metformin XR 500mg' }));
    });
    
    it('should call onCancel when the cancel button is clicked', () => {
        const handleCancel = vi.fn();
        render(<MedicationForm medication={null} onSave={() => {}} onCancel={handleCancel} onDelete={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when the delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(<MedicationForm medication={mockMedication} onSave={() => {}} onCancel={() => {}} onDelete={handleDelete} />);
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
        expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('should add and remove dosage rows correctly', () => {
        const { container } = render(<MedicationForm medication={mockMedication} onSave={() => {}} onCancel={() => {}} onDelete={() => {}} />);

        let timeInputs = container.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(1);

        fireEvent.click(screen.getByText('+ Add Dosage'));
        
        timeInputs = container.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(2);

        fireEvent.click(screen.getAllByText('Remove')[0]);
        
        timeInputs = container.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(1);
    });
});