import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicationForm from '../../Medications/MedicationForm/MedicationForm';

// fake version of URL.createObjectURL for our tests.
// This prevents the "is not a function" error.
window.URL.createObjectURL = vi.fn(() => 'mock-url');



// --- Mock Services ---
vi.mock('../../services/medicationScannerService', () => ({
  default: {
    validateImageFile: vi.fn(() => true),
    checkApiHealth: vi.fn(() => Promise.resolve(true)),
    scanMedicationImage: vi.fn(() => Promise.resolve({ name: 'Scanned Med' })),
    formatMedicationData: vi.fn((data) => ({ name: data.name, usedFor: 'Test Use' })),
  },
}));
vi.mock('../../services/medicationCloudinaryService', () => ({
  default: {
    uploadMedicationImage: vi.fn(() => Promise.resolve({ url: 'http://new-image.com', public_id: '123' })),
  },
}));


describe('MedicationForm Component (New Version)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL.mockClear(); // Also clear the URL mock
    });

    it('should render both scanner and manual entry sections', () => {
        render(<MedicationForm medication={null} onSave={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('📷 Scan Medication')).toBeInTheDocument();
        expect(screen.getByText('✏️ Manual Entry')).toBeInTheDocument();
    });

    it('should enable the scan button and show a preview when a file is selected', async () => {
        const { container } = render(<MedicationForm medication={null} onSave={() => {}} onCancel={() => {}} />);

        const fileInput = container.querySelector('.scanner-section .file-input');
        const scanButton = screen.getByRole('button', { name: /Scan Medication/i });

        expect(scanButton).toBeDisabled();

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const previewImage = await screen.findByRole('img', { name: /Selected medication/i });
        expect(previewImage).toBeInTheDocument();
        expect(scanButton).not.toBeDisabled();
    });

    it('should call the scanner service when the scan button is clicked', async () => {
        const medicationScannerService = (await import('../../services/medicationScannerService')).default;
        const { container } = render(<MedicationForm medication={null} onSave={() => {}} onCancel={() => {}} />);

        const fileInput = container.querySelector('.scanner-section .file-input');
        const scanButton = screen.getByRole('button', { name: /Scan Medication/i });
        
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => expect(scanButton).not.toBeDisabled());
        
        fireEvent.click(scanButton);

        await waitFor(() => {
            expect(medicationScannerService.scanMedicationImage).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByLabelText('Medication Name *')).toHaveValue('Scanned Med');
    });

    it('should call onSave with the manual entry data when "Save Medicine" is clicked', () => {
        const handleSave = vi.fn();
        render(<MedicationForm medication={null} onSave={handleSave} onCancel={() => {}} />);
        
        const nameInput = screen.getByLabelText('Medication Name *');
        const saveButton = screen.getByRole('button', { name: 'Save Medicine' });

        fireEvent.change(nameInput, { target: { value: 'Manual Med' } });
        fireEvent.click(saveButton);

        expect(handleSave).toHaveBeenCalledTimes(1);
        expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Manual Med' }));
    });
});