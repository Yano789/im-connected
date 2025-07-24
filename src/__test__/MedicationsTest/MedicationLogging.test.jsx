import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationLogging from '../../Medications/MedicationLogging/MedicationLogging';

vi.mock('../../Medications/MedicationItem/MedicationItem', () => ({
  default: ({ medication }) => <div data-testid="med-item">{medication.name}</div>,
}));

const mockMedications = [
    { id: 'med1', name: 'Metformin XR 500mg', dosages: [] },
    { id: 'med2', name: 'Glucosamine Sulfate 500 mg', dosages: [] },
];

describe('MedicationLogging Component', () => {

  it('should render a list of MedicationItem components based on props', () => {
    render(
      <MedicationLogging 
        medications={mockMedications} 
        onSelect={() => {}} 
        selectedMedicationId={'med1'} 
        onAddNew={() => {}} 
      />
    );

    expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
    expect(screen.getByText('Glucosamine Sulfate 500 mg')).toBeInTheDocument();
    expect(screen.getAllByTestId('med-item').length).toBe(2);
  });

  it('should call the onAddNew function when the add button is clicked', () => {
    const handleAddNew = vi.fn();

    render(
      <MedicationLogging 
        medications={mockMedications} 
        onSelect={() => {}} 
        selectedMedicationId={'med1'} 
        onAddNew={handleAddNew} 
      />
    );

    const addButton = screen.getByText('Add more medication').closest('button');
    fireEvent.click(addButton);
    expect(handleAddNew).toHaveBeenCalledTimes(1);
  });

  it('should apply the "selected" class to the add button when no medication is selected', () => {
    const { container } = render(
        <MedicationLogging 
            medications={mockMedications} 
            onSelect={() => {}} 
            selectedMedicationId={null} 
            onAddNew={() => {}} 
        />
    );

    const addButton = container.querySelector('.add-medication-button');
    expect(addButton.classList.contains('selected')).toBe(true);
  });

  it('should NOT apply the "selected" class to the add button when a medication is selected', () => {
    const { container } = render(
        <MedicationLogging 
            medications={mockMedications} 
            onSelect={() => {}} 
            selectedMedicationId={'med1'} 
            onAddNew={() => {}} 
        />
    );

    const addButton = container.querySelector('.add-medication-button');
    expect(addButton.classList.contains('selected')).toBe(false);
  });
});