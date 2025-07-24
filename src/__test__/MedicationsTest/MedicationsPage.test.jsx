import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MedicationsPage from '../../Medications/MedicationsPage/MedicationsPage';

vi.mock('../../Medications/CareRecipientList/CareRecipientList', () => ({
  default: ({ recipients, onSelect, onAdd, selectedRecipientId }) => (
    <div>
      <h2>My Care Recipients</h2>
      {recipients.map(r => (
        <button key={r.id} onClick={() => onSelect(r)}>
          {r.name} {r.id === selectedRecipientId ? '(Showing)' : ''}
        </button>
      ))}
      <button onClick={onAdd}>Add Care Recipient</button>
    </div>
  ),
}));

vi.mock('../../Medications/MedicationLogging/MedicationLogging', () => ({
  default: ({ medications, onAddNew }) => (
    <div>
      <h3>Medication Logging</h3>
      {medications.map(m => <div key={m.id}>{m.name}</div>)}
      <button onClick={onAddNew}>Add more medication</button>
    </div>
  ),
}));

vi.mock('../../Medications/MedicationDetails/MedicationDetails', () => ({
  default: ({ medication, onEdit }) => (
    <div>
      <h2>Medication Details</h2>
      {medication && <p>{medication.name}</p>}
      <button onClick={onEdit}>Edit medicine</button>
    </div>
  ),
}));

vi.mock('../../Medications/MedicationForm/MedicationForm', () => ({
  default: () => <div>Medication Form</div>,
}));

vi.mock('../../TopHeader/Header/Header', () => ({
  default: () => <header>Mock Header</header>,
}));
// ------------------------------------

describe('MedicationsPage Component', () => {

  it('should render correctly with the first care recipient selected', () => {
    render(
      <MemoryRouter>
        <MedicationsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Medications for/i)).toHaveTextContent('JAMES TAN');
    expect(screen.getAllByText('Metformin XR 500mg').length).toBe(2);
    expect(screen.getByText('Glucosamine Sulfate 500 mg')).toBeInTheDocument();
    expect(screen.getByText('Medication Details')).toBeInTheDocument();
  });

  it('should display the second recipient\'s data when switched', () => {
    render(
      <MemoryRouter>
        <MedicationsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Amelia Tan'));
    expect(screen.getByText(/Medications for/i)).toHaveTextContent('AMELIA TAN');
    expect(screen.getAllByText('Aspirin 100mg').length).toBe(2);
    expect(screen.queryByText('Metformin XR 500mg')).not.toBeInTheDocument();
  });

  it('should switch to the medication form when "Add more medication" is clicked', () => {
    render(
      <MemoryRouter>
        <MedicationsPage />
      </MemoryRouter>
    );

    expect(screen.queryByText('Medication Form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Add more medication'));
    expect(screen.getByText('Medication Form')).toBeInTheDocument();
    expect(screen.queryByText('Medication Details')).not.toBeInTheDocument();
  });
});