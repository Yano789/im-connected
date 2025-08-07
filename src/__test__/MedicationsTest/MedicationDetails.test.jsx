import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicationDetails from '../../Medications/MedicationDetails/MedicationDetails';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <div>{children}</div>,
}));

// Mock the translation service
vi.mock('../../Medications/services/medicationTranslationService', () => ({
    default: {
        translateMedication: vi.fn((medication) => Promise.resolve(medication)),
    },
}));

// Test Data
const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [
        { time: '10:00', taken: true, period: 'Morning' },
        { time: '18:00', taken: false, period: 'Evening' }
    ],
    dosage: '500mg twice daily',
    usedTo: 'Type 2 diabetes management',
    sideEffects: 'Nausea, stomach upset',
    warnings: 'Take with food',
    image: 'http://example.com/medication.jpg'
};

const defaultProps = {
    medication: mockMedication,
    onEdit: vi.fn(),
};

describe('MedicationDetails Component (Updated Version)', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Reset the mock to return the input medication by default
        const mockTranslationService = (await import('../../Medications/services/medicationTranslationService')).default;
        mockTranslationService.translateMedication.mockImplementation((med) => Promise.resolve(med));
    });

    it('should render placeholder when no medication is provided', () => {
        render(<MedicationDetails medication={null} onEdit={vi.fn()} />);
        expect(screen.getByText('Select a medication to see its details.')).toBeInTheDocument();
    });

    it('should show loading state while translating', async () => {
        const medicationTranslationService = await import('../../Medications/services/medicationTranslationService');
        medicationTranslationService.default.translateMedication.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve(mockMedication), 100))
        );

        render(<MedicationDetails {...defaultProps} />);
        
        expect(screen.getByText('Loading... 🌐')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
        });
    });

    it('should render medication details after translation', async () => {
        render(<MedicationDetails {...defaultProps} />);
        
        await waitFor(() => {
            expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
        });

        expect(screen.getByText('Schedule')).toBeInTheDocument();
        expect(screen.getByText('Dosage')).toBeInTheDocument();
        expect(screen.getByText('Used For')).toBeInTheDocument();
        expect(screen.getByText('Side Effects')).toBeInTheDocument();
        expect(screen.getByText('Warnings')).toBeInTheDocument();
        expect(screen.getByText('Image')).toBeInTheDocument();
    });

    it('should display medication information correctly', async () => {
        render(<MedicationDetails {...defaultProps} />);
        
        await waitFor(() => {
            expect(screen.getByText('500mg twice daily')).toBeInTheDocument();
            expect(screen.getByText('Type 2 diabetes management')).toBeInTheDocument();
            expect(screen.getByText('Nausea, stomach upset')).toBeInTheDocument();
            expect(screen.getByText('Take with food')).toBeInTheDocument();
        });
    });

    it('should show schedule icons when no text schedule is provided', async () => {
        const medicationWithoutSchedule = {
            ...mockMedication,
            schedule: undefined
        };

        render(<MedicationDetails medication={medicationWithoutSchedule} onEdit={vi.fn()} />);
        
        await waitFor(() => {
            expect(screen.getByText('Morning')).toBeInTheDocument();
            expect(screen.getByText('Afternoon')).toBeInTheDocument();
            expect(screen.getByText('Evening')).toBeInTheDocument();
            expect(screen.getByText('Night')).toBeInTheDocument();
        });
    });

    it('should display medication image when available', async () => {
        render(<MedicationDetails {...defaultProps} />);
        
        await waitFor(() => {
            const image = screen.getByRole('img', { name: 'Metformin XR 500mg' });
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'http://example.com/medication.jpg');
        });
    });

    it('should show placeholder when no image is available', async () => {
        const medicationWithoutImage = {
            ...mockMedication,
            image: null
        };

        // Ensure the mock returns the medication without image
        const mockTranslationService = (await import('../../Medications/services/medicationTranslationService')).default;
        mockTranslationService.translateMedication.mockResolvedValue(medicationWithoutImage);

        render(<MedicationDetails medication={medicationWithoutImage} onEdit={vi.fn()} />);
        
        await waitFor(() => {
            expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
        });
        
        // Check for no image placeholder
        expect(screen.getByText('No image available')).toBeInTheDocument();
        expect(screen.getByText('Upload an image when editing this medication')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
        const handleEdit = vi.fn();
        render(<MedicationDetails {...defaultProps} onEdit={handleEdit} />);
        
        await waitFor(() => {
            expect(screen.getByText('Edit medicine')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Edit medicine'));
        expect(handleEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle optional fields gracefully', async () => {
        const minimalMedication = {
            id: 'med2',
            name: 'Simple Med',
            usedTo: 'Pain relief',
            sideEffects: 'Drowsiness'
            // Note: no dosage, warnings, or image fields
        };

        // Ensure the mock returns the minimal medication
        const mockTranslationService = (await import('../../Medications/services/medicationTranslationService')).default;
        mockTranslationService.translateMedication.mockResolvedValue(minimalMedication);

        render(<MedicationDetails medication={minimalMedication} onEdit={vi.fn()} />);
        
        await waitFor(() => {
            expect(screen.getByText('Simple Med')).toBeInTheDocument();
        });
        
        expect(screen.getByText('Pain relief')).toBeInTheDocument();
        expect(screen.getByText('Drowsiness')).toBeInTheDocument();

        // Check that warnings section is not rendered when warnings field is missing
        expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
    });

    it('should call translation service when component mounts', async () => {
        const medicationTranslationService = await import('../../Medications/services/medicationTranslationService');
        const translateSpy = vi.spyOn(medicationTranslationService.default, 'translateMedication');
        
        render(<MedicationDetails {...defaultProps} />);
        
        await waitFor(() => {
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith(mockMedication);
        });
    });
});