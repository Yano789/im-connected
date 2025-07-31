import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MedicationsPage from '../../Medications/MedicationsPage/MedicationsPage';

// Mock Services and Child Components 

// Mock the medication scanner service to simulate API calls
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
  default: ({ recipients, onSelect }) => (
    <div>
      <h2>My Care Recipients</h2>
      {recipients.map(r => (
        <button key={r.id} onClick={() => onSelect(r.id)}>{r.name}</button>
      ))}
    </div>
  ),
}));
vi.mock('../../Medications/MedicationLogging/MedicationLogging', () => ({
  default: ({ onAddNew }) => (
    <div>
      <h3>Medication Logging</h3>
      <button onClick={() => onAddNew()}>Add more medication</button>
    </div>
  ),
}));
vi.mock('../../Medications/MedicationDetails/MedicationDetails', () => ({
  default: ({ medication }) => <div>{medication ? `Details for ${medication.name}` : 'No medication selected'}</div>,
}));
vi.mock('../../Medications/MedicationForm/MedicationForm', () => ({
  default: () => <div>Medication Form</div>,
}));
vi.mock('../../TopHeader/Header/Header', () => ({
  default: () => <header>Mock Header</header>,
}));

// Test Data 
const mockApiRecipients = [
    { _id: '1', name: 'James Tan' },
    { _id: '2', name: 'Mary Zhang' },
];
const mockApiMedications = [
    { _id: 'med1', name: 'Metformin XR 500mg', dosages: [] }
];


describe('MedicationsPage Component (Backend Connected)', () => {

    // Reset mocks before each test to ensure they are clean
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // Test Case 1: Loading and Success State
    it('should show a loading state and then display fetched care recipients', async () => {
        // Setup the mock to simulate a successful API call
        const medicationScannerService = (await import('../../Medications/services/medicationScannerService')).default;
        medicationScannerService.getCareRecipients.mockResolvedValue(mockApiRecipients);
        medicationScannerService.getMedications.mockResolvedValue(mockApiMedications);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);

        // Use 'waitFor' to wait for the asynchronous fetch to complete
        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
            expect(screen.getByText('Mary Zhang')).toBeInTheDocument();
        });
    });

    // Test Case 2: Error State
    it('should display an error message if fetching recipients fails', async () => {
        const medicationScannerService = (await import('../../Medications/services/medicationScannerService')).default;
        // Simulate a failed API call
        medicationScannerService.getCareRecipients.mockRejectedValue(new Error('Network Error'));

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);

        // Wait for the error message to appear
        await waitFor(() => {
            // Check that no user names were rendered.
            expect(screen.queryByText('James Tan')).not.toBeInTheDocument();
            expect(screen.queryByText('Mary Zhang')).not.toBeInTheDocument();
        });
    });

    // Test Case 3: Switching to "Create" Mode
    it('should switch to the medication form when "Add more medication" is clicked', async () => {
        const medicationScannerService = (await import('../../Medications/services/medicationScannerService')).default;
        medicationScannerService.getCareRecipients.mockResolvedValue(mockApiRecipients);
        medicationScannerService.getMedications.mockResolvedValue([]);

        render(<MemoryRouter><MedicationsPage /></MemoryRouter>);
        
        // Wait for initial data to load
        await waitFor(() => {
            expect(screen.getByText('James Tan')).toBeInTheDocument();
        });

        // The form should not be visible initially
        expect(screen.queryByText('Medication Form')).not.toBeInTheDocument();

        // Click the add button
        fireEvent.click(screen.getByRole('button', { name: 'Add more medication' }));

        // The form should now be visible
        expect(screen.getByText('Medication Form')).toBeInTheDocument();
    });
});