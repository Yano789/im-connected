import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicationForm from '../../Medications/MedicationForm/MedicationForm';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock URL.createObjectURL for file handling
window.URL.createObjectURL = vi.fn(() => 'mock-url');
window.URL.revokeObjectURL = vi.fn();

// Mock Services
vi.mock('../../Medications/services/medicationScannerService', () => ({
  default: {
    validateImageFile: vi.fn(() => true),
    checkApiHealth: vi.fn(() => Promise.resolve(true)),
    scanMedicationImage: vi.fn(() => Promise.resolve({ 
        name: 'Scanned Med',
        usedFor: 'Scanned condition',
        sideEffects: 'Scanned side effects'
    })),
    formatMedicationData: vi.fn((data) => data),
  },
}));

vi.mock('../../Medications/services/medicationCloudinaryService', () => ({
  default: {
    uploadMedicationImage: vi.fn(() => Promise.resolve({ 
        url: 'http://new-image.com', 
        public_id: '123' 
    })),
  },
}));

const defaultProps = {
    medication: null,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onDelete: null,
    capturedFile: null,
    selectedRecipient: { id: '1', name: 'Test Recipient' },
};

describe('MedicationForm Component (Updated Version)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL.mockClear();
        window.URL.revokeObjectURL.mockClear();
    });

    it('should render form fields and buttons for new medication', () => {
        render(<MedicationForm {...defaultProps} />);
        
        expect(screen.getByLabelText(/Medication Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Used to treat/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Side Effects/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dosage/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Medicine/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should populate form when editing existing medication', () => {
        const existingMedication = {
            id: 'med1',
            name: 'Existing Med',
            usedTo: 'Test condition',
            sideEffects: 'Test side effects',
            dosage: '1 tablet daily',
            schedule: 'Morning',
            warnings: 'Test warnings',
            dosages: [{ time: '09:00', taken: false }],
            image: 'http://example.com/image.jpg'
        };

        render(
            <MedicationForm 
                {...defaultProps}
                medication={existingMedication}
            />
        );
        
        expect(screen.getByDisplayValue('Existing Med')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test condition')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test side effects')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1 tablet daily')).toBeInTheDocument();
    });

    it('should show delete button when editing existing medication', () => {
        const existingMedication = {
            id: 'med1',
            name: 'Existing Med',
        };

        render(
            <MedicationForm 
                {...defaultProps}
                medication={existingMedication}
                onDelete={vi.fn()}
            />
        );
        
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should handle form input changes', () => {
        render(<MedicationForm {...defaultProps} />);
        
        const nameInput = screen.getByLabelText(/Medication Name/i);
        fireEvent.change(nameInput, { target: { value: 'New Medicine' } });
        
        expect(nameInput.value).toBe('New Medicine');
    });

    it('should enable scan button when file is selected', async () => {
        const { container } = render(<MedicationForm {...defaultProps} />);
        
        const fileInput = container.querySelector('input[type="file"]');
        const scanButton = screen.getByRole('button', { name: /Scan & Save to Database/i });
        
        expect(scanButton).toBeDisabled();
        
        const file = new File(['test'], 'medication.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(scanButton).not.toBeDisabled();
        });
    });

    it('should show preview image when file is selected', async () => {
        const { container } = render(<MedicationForm {...defaultProps} />);
        
        const fileInput = container.querySelector('input[type="file"]');
        const file = new File(['test'], 'medication.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
            const previewImage = screen.getByAltText('Selected medication');
            expect(previewImage).toBeInTheDocument();
            expect(previewImage).toHaveAttribute('src', 'mock-url');
        });
    });

    it('should call scanner service when scan button is clicked', async () => {
        const medicationScannerService = await import('../../Medications/services/medicationScannerService');
        const { container } = render(<MedicationForm {...defaultProps} />);
        
        const fileInput = container.querySelector('input[type="file"]');
        const file = new File(['test'], 'medication.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
            const scanButton = screen.getByRole('button', { name: /Scan & Save to Database/i });
            expect(scanButton).not.toBeDisabled();
            fireEvent.click(scanButton);
        });
        
        await waitFor(() => {
            expect(medicationScannerService.default.scanMedicationImage).toHaveBeenCalledWith(file);
        });
    });

    it('should populate form fields after successful scan', async () => {
        const { container } = render(<MedicationForm {...defaultProps} />);
        
        const fileInput = container.querySelector('input[type="file"]');
        const file = new File(['test'], 'medication.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
            const scanButton = screen.getByRole('button', { name: /Scan & Save to Database/i });
            fireEvent.click(scanButton);
        });
        
        await waitFor(() => {
            expect(screen.getByDisplayValue('Scanned Med')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Scanned condition')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Scanned side effects')).toBeInTheDocument();
        });
    });

    it('should handle dosage time changes', () => {
        render(<MedicationForm {...defaultProps} />);
        
        const timeInputs = screen.getAllByDisplayValue('');
        const firstTimeInput = timeInputs.find(input => input.type === 'time');
        
        if (firstTimeInput) {
            fireEvent.change(firstTimeInput, { target: { value: '09:00' } });
            expect(firstTimeInput.value).toBe('09:00');
        }
    });

    it('should add new dosage row when add button is clicked', () => {
        const { container } = render(<MedicationForm {...defaultProps} />);
        
        const initialTimeInputs = screen.getAllByDisplayValue('').filter(input => input.type === 'time');
        const addButton = screen.getByRole('button', { name: /Add Dosage/i });
        
        fireEvent.click(addButton);
        
        // After adding, there should be one input with the default time '09:00' and one still empty
        const timeInputs = container.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(2); // Should have 2 time inputs total
    });

    it('should call onSave with form data when save button is clicked', () => {
        const handleSave = vi.fn();
        render(
            <MedicationForm 
                {...defaultProps}
                onSave={handleSave}
            />
        );
        
        const nameInput = screen.getByLabelText(/Medication Name/i);
        fireEvent.change(nameInput, { target: { value: 'Test Medicine' } });
        
        const saveButton = screen.getByRole('button', { name: /Save Medicine/i });
        fireEvent.click(saveButton);
        
        expect(handleSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test Medicine'
            })
        );
    });

    it('should call onCancel when cancel button is clicked', () => {
        const handleCancel = vi.fn();
        render(
            <MedicationForm 
                {...defaultProps}
                onCancel={handleCancel}
            />
        );
        
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);
        
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle captured file from camera', () => {
        const capturedFile = new File(['camera'], 'camera.jpg', { type: 'image/jpeg' });
        
        render(
            <MedicationForm 
                {...defaultProps}
                capturedFile={capturedFile}
            />
        );
        
        // Should show preview of captured file
        expect(screen.getByAltText('Selected medication')).toBeInTheDocument();
    });
});