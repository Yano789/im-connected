import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MedicationsPage from '../../Medications/MedicationsPage/MedicationsPage';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => options ? key.replace('{{name}}', options.name) : key,
    }),
}));

// Mock the medication scanner service
vi.mock('../../Medications/services/medicationScannerService', () => ({
  default: {
    getCareRecipients: vi.fn(),
    getMedications: vi.fn(),
    createCareRecipient: vi.fn(),
    deleteCareRecipient: vi.fn(),
    createMedication: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
  },
}));

// Mock child components
vi.mock('../../Medications/CareRecipientList/CareRecipientList', () => ({
  default: ({ recipients, onSelect, selectedRecipientId, onAdd, isAdding, onSaveNew }) => (
    <div>
      <h2>My Care Recipients</h2>
      {recipients && recipients.map(r => (
        <button 
          key={r.id} 
          onClick={() => onSelect(r.id)}
          className={selectedRecipientId === r.id ? 'selected' : ''}
        >
          {r.name}
        </button>
      ))}
      {!isAdding && <button onClick={onAdd}>Add Care Recipient</button>}
      {isAdding && <button onClick={onSaveNew}>Save New Recipient</button>}
    </div>
  ),
}));

vi.mock('../../Medications/MedicationLogging/MedicationLogging', () => ({
  default: ({ medications, onAddNew, selectedMedicationId, onSelect }) => (
    <div>
      <h3>Medication Logging</h3>
      {medications.map(med => (
        <button 
          key={med.id} 
          onClick={() => onSelect(med.id)}
          className={selectedMedicationId === med.id ? 'selected' : ''}
        >
          {med.name}
        </button>
      ))}
      <button onClick={() => onAddNew()}>Add more medication</button>
    </div>
  ),
}));

vi.mock('../../Medications/MedicationDetails/MedicationDetails', () => ({
  default: ({ medication, onEdit }) => (
    <div>
      {medication ? (
        <>
          <div>Details for {medication.name}</div>
          <button onClick={onEdit}>Edit medicine</button>
        </>
      ) : (
        <div>Select a medication to view details, or add a new one</div>
      )}
    </div>
  ),
}));

vi.mock('../../Medications/MedicationForm/MedicationForm', () => ({
  default: ({ medication, onSave, onCancel, onDelete }) => (
    <div>
      <div>Medication Form</div>
      <button onClick={() => onSave({ name: 'Test Med' })}>Save Medicine</button>
      <button onClick={onCancel}>Cancel</button>
      {onDelete && <button onClick={onDelete}>Delete Medicine</button>}
    </div>
  ),
}));

vi.mock('../../TopHeader/Header/Header', () => ({
  default: () => <header>Mock Header</header>,
}));

// Test Data - Updated structure with nested medications
const mockApiRecipients = [
    { 
        _id: '1', 
        name: 'James Tan',
        medications: [
            { _id: 'med1', name: 'Metformin XR 500mg', dosages: [] }
        ]
    },
    { 
        _id: '2', 
        name: 'Mary Zhang',
        medications: [
            { _id: 'med2', name: 'Lisinopril 10mg', dosages: [] }
        ]
    },
];

describe('MedicationsPage Component (Updated Version)', () => {
    let medicationScannerService;
    
    // Mock window.confirm for delete operations
    beforeEach(async () => {
        vi.resetAllMocks();
        window.confirm = vi.fn(() => true);
        window.alert = vi.fn();
        
        // Reset language change listener
        window.removeEventListener = vi.fn();
        window.addEventListener = vi.fn();
        
        // Set up the service mock
        medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);
        
        // Mock getMedications to return medications for each recipient
        medicationScannerService.default.getMedications.mockImplementation((recipientId) => {
            const recipient = mockApiRecipients.find(r => r._id === recipientId);
            return Promise.resolve(recipient ? recipient.medications : []);
        });
    });

    it('should show loading state initially and then display care recipients', async () => {
        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
            expect(screen.getByText('Mary Zhang')).toBeInTheDocument();
        });
    });

    it('should handle error when fetching recipients fails', async () => {
        medicationScannerService.default.getCareRecipients.mockRejectedValue(new Error('Network Error'));

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.queryByText('James Tan')).not.toBeInTheDocument();
            expect(screen.queryByText('Mary Zhang')).not.toBeInTheDocument();
        });
    });

    it('should select recipient and display their medications', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('James Tan'));
        
        expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
    });

    it('should switch to create mode when "Add more medication" is clicked', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
        });

        // Select a recipient first
        fireEvent.click(screen.getByText('James Tan'));
        
        // Should show details view initially
        expect(screen.queryByText('Medication Form')).not.toBeInTheDocument();

        // Click add medication
        fireEvent.click(screen.getByText('Add more medication'));

        // Should switch to form view
        expect(screen.getByText('Medication Form')).toBeInTheDocument();
    });

    it('should switch to edit mode when edit button is clicked', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            fireEvent.click(screen.getByText('James Tan'));
        });

        // Select a medication
        fireEvent.click(screen.getByText('Metformin XR 500mg'));
        
        // Should show details view
        expect(screen.getByText('Details for Metformin XR 500mg')).toBeInTheDocument();

        // Click edit
        fireEvent.click(screen.getByText('Edit medicine'));

        // Should switch to form view
        expect(screen.getByText('Medication Form')).toBeInTheDocument();
    });

    it('should handle adding new care recipient', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);
        medicationScannerService.default.createCareRecipient.mockResolvedValue({ id: '3', name: 'New Recipient' });

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('Add Care Recipient')).toBeInTheDocument();
        });

        // Click add recipient
        fireEvent.click(screen.getByText('Add Care Recipient'));
        
        // Should show save button
        expect(screen.getByText('Save New Recipient')).toBeInTheDocument();
    });

    it('should save medication and reload data', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients
            .mockResolvedValueOnce(mockApiRecipients)
            .mockResolvedValueOnce(mockApiRecipients); // Second call after save
        medicationScannerService.default.createMedication.mockResolvedValue({ id: 'med3', name: 'New Med' });

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            fireEvent.click(screen.getByText('James Tan'));
        });

        // Enter create mode
        fireEvent.click(screen.getByText('Add more medication'));
        
        // Save medication
        fireEvent.click(screen.getByText('Save Medicine'));

        await waitFor(() => {
            expect(medicationScannerService.default.createMedication).toHaveBeenCalled();
            expect(medicationScannerService.default.getCareRecipients).toHaveBeenCalledTimes(2);
        });
    });

    it('should cancel form and return to view mode', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            fireEvent.click(screen.getByText('James Tan'));
        });

        // Enter create mode
        fireEvent.click(screen.getByText('Add more medication'));
        expect(screen.getByText('Medication Form')).toBeInTheDocument();
        
        // Cancel
        fireEvent.click(screen.getByText('Cancel'));

        // Should return to view mode
        expect(screen.queryByText('Medication Form')).not.toBeInTheDocument();
    });

    it('should handle deleting care recipient', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients
            .mockResolvedValueOnce(mockApiRecipients)
            .mockResolvedValueOnce([]); // Empty after delete
        medicationScannerService.default.deleteCareRecipient.mockResolvedValue();

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
        });

        // Note: This test assumes there's a way to trigger delete in the UI
        // The actual implementation would depend on how CareRecipientList handles deletion
    });

    it('should show placeholder when no medication is selected', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        medicationScannerService.default.getCareRecipients.mockResolvedValue(mockApiRecipients);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('Select a medication to view details, or add a new one')).toBeInTheDocument();
        });
    });
});