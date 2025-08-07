import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicationLogging from '../../Medications/MedicationLogging/MedicationLogging';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock Child Component
vi.mock('../../Medications/MedicationItem/MedicationItem', () => ({
  default: ({ medication, onSelect, isSelected, onToggleDose }) => (
    <div 
      className={`mock-medication-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(medication.id)}
    >
      <span>{medication.name}</span>
      <button onClick={() => onToggleDose(medication.id, 0)}>Toggle Dose</button>
    </div>
  ),
}));

// Mock services
vi.mock('../../Medications/services/medicationScannerService', () => ({
  default: {
    validateImageFile: vi.fn(() => true),
  },
}));

// Mock getUserMedia for camera functionality
const mockMediaDevices = {
  getUserMedia: vi.fn(),
  enumerateDevices: vi.fn(),
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

// Mock URL for object creation
global.URL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
};

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  value: vi.fn(),
  writable: true,
});

// Mock HTMLCanvasElement methods
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(),
    createImageData: vi.fn(),
    putImageData: vi.fn(),
  })),
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: vi.fn((callback) => {
    callback(new Blob(['mock'], { type: 'image/jpeg' }));
  }),
  writable: true,
});

// Test data
const mockMedications = [
  { id: 'med1', name: 'Metformin XR 500mg', dosages: [{ time: '09:00', taken: false }] },
  { id: 'med2', name: 'Lisinopril 10mg', dosages: [{ time: '18:00', taken: true }] },
];

const defaultProps = {
  medications: mockMedications,
  onSelect: vi.fn(),
  selectedMedicationId: null,
  onAddNew: vi.fn(),
  onToggleDose: vi.fn(),
};

describe('MedicationLogging Component (Updated Version)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMediaDevices.getUserMedia.mockClear();
    });

    it('should render medication list and action buttons', async () => {
        render(<MedicationLogging {...defaultProps} />);

        expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
        expect(screen.getByText('Lisinopril 10mg')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add more medication/i })).toBeInTheDocument();
        
        // The Upload Image and Use Camera buttons should be visible when not in camera mode
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Upload Image/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Use Camera/i })).toBeInTheDocument();
        });
    });

    it('should display selected medication with selected class', () => {
        render(
            <MedicationLogging 
                {...defaultProps}
                selectedMedicationId="med1"
            />
        );

        const selectedItem = screen.getByText('Metformin XR 500mg').closest('.mock-medication-item');
        expect(selectedItem).toHaveClass('selected');
    });

    it('should call onSelect when medication item is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <MedicationLogging 
                {...defaultProps}
                onSelect={handleSelect}
            />
        );

        fireEvent.click(screen.getByText('Metformin XR 500mg'));
        expect(handleSelect).toHaveBeenCalledWith('med1');
    });

    it('should call onToggleDose when dose toggle is clicked', () => {
        const handleToggleDose = vi.fn();
        render(
            <MedicationLogging 
                {...defaultProps}
                onToggleDose={handleToggleDose}
            />
        );

        const toggleButtons = screen.getAllByText('Toggle Dose');
        fireEvent.click(toggleButtons[0]);
        expect(handleToggleDose).toHaveBeenCalledWith('med1', 0);
    });

    it('should call onAddNew when manual add button is clicked', () => {
        const handleAddNew = vi.fn();
        render(
            <MedicationLogging 
                {...defaultProps}
                onAddNew={handleAddNew}
            />
        );
        
        fireEvent.click(screen.getByRole('button', { name: /Add more medication/i }));
        expect(handleAddNew).toHaveBeenCalledTimes(1);
        expect(handleAddNew).toHaveBeenCalledWith();
    });

    it('should trigger file upload when upload button is clicked', async () => {
        render(<MedicationLogging {...defaultProps} />);
        
        // Mock document.createElement to capture the created input - do this after render
        const mockInput = {
            type: '',
            accept: '',
            click: vi.fn(),
            onchange: null
        };
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockInput);
        
        // Wait for upload button to be visible and click it
        await waitFor(() => {
            const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
            fireEvent.click(uploadButton);
        });
        
        // Verify input was created and clicked
        expect(createElementSpy).toHaveBeenCalledWith('input');
        expect(mockInput.type).toBe('file');
        expect(mockInput.accept).toBe('image/*');
        expect(mockInput.click).toHaveBeenCalled();
        
        createElementSpy.mockRestore();
    });

    it('should handle file selection and call onAddNew with file', async () => {
        const handleAddNew = vi.fn();
        
        render(
            <MedicationLogging 
                {...defaultProps}
                onAddNew={handleAddNew}
            />
        );
        
        // Mock document.createElement to capture the created input - do this after render
        const mockInput = {
            type: '',
            accept: '',
            click: vi.fn(),
            onchange: null
        };
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockInput);
        
        // Click upload button to create input
        await waitFor(() => {
            const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
            fireEvent.click(uploadButton);
        });
        
        // Simulate file selection
        const file = new File(['test'], 'medication.jpg', { type: 'image/jpeg' });
        const changeEvent = { target: { files: [file] } };
        
        // Trigger the onchange handler that was set on the mock input
        if (mockInput.onchange) {
            mockInput.onchange(changeEvent);
        }
        
        // The component should validate and then call onAddNew
        await waitFor(() => {
            expect(handleAddNew).toHaveBeenCalledWith(file);
        });
        
        createElementSpy.mockRestore();
    });

    it('should start camera when "Use Camera" button is clicked', async () => {
        const mockStream = {
            getVideoTracks: () => [{ stop: vi.fn() }],
            getTracks: () => [{ stop: vi.fn() }],
        };
        mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
        
        render(<MedicationLogging {...defaultProps} />);
        
        const cameraButton = screen.getByRole('button', { name: /Use Camera/i });
        fireEvent.click(cameraButton);
        
        await waitFor(() => {
            expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith(
                expect.objectContaining({
                    video: expect.objectContaining({
                        facingMode: 'environment'
                    })
                })
            );
        });
        
        // Should show camera interface
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Capture/i })).toBeInTheDocument();
        });
    });

    it('should show camera controls when camera is active', async () => {
        const mockStream = {
            getVideoTracks: () => [{ stop: vi.fn() }],
            getTracks: () => [{ stop: vi.fn() }],
        };
        mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
        
        render(<MedicationLogging {...defaultProps} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Use Camera/i }));
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Capture/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Front/i })).toBeInTheDocument();
        });
    });

    it('should handle camera errors gracefully', async () => {
        mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Camera not available'));
        
        render(<MedicationLogging {...defaultProps} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Use Camera/i }));
        
        await waitFor(() => {
            // Should not show camera interface on error
            expect(screen.queryByRole('button', { name: /Capture/i })).not.toBeInTheDocument();
        });
    });

    it('should cancel camera and return to normal view', async () => {
        const mockStream = {
            getVideoTracks: () => [{ stop: vi.fn() }],
            getTracks: () => [{ stop: vi.fn() }],
        };
        mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
        
        render(<MedicationLogging {...defaultProps} />);
        
        // Start camera
        fireEvent.click(screen.getByRole('button', { name: /Use Camera/i }));
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        });
        
        // Cancel camera
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Capture/i })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Use Camera/i })).toBeInTheDocument();
        });
    });

    it('should render empty state when no medications are provided', () => {
        render(
            <MedicationLogging 
                {...defaultProps}
                medications={[]}
            />
        );

        expect(screen.queryByText('Metformin XR 500mg')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add more medication/i })).toBeInTheDocument();
    });
});