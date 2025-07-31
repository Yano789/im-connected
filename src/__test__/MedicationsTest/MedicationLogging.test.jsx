import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationLogging from '../../Medications/MedicationLogging/MedicationLogging';

// Mock Child Component and Services 
vi.mock('../../Medications/MedicationItem/MedicationItem', () => ({
  default: ({ medication }) => <div>{medication.name}</div>,
}));

vi.mock('../../Medications/services/medicationScannerService', () => ({
  default: {
    validateImageFile: () => true,
  },
}));


describe('MedicationLogging Component (New Version)', () => {

    it('should render the main buttons for adding medication', () => {
        render(<MedicationLogging medications={[]} />);

        expect(screen.getByText('Add more medication')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Image/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Use Camera/i })).toBeInTheDocument();
    });

    it('should call onAddNew without a file when the manual add button is clicked', () => {
        const handleAddNew = vi.fn();
        render(<MedicationLogging medications={[]} onAddNew={handleAddNew} />);
        
        fireEvent.click(screen.getByText('Add more medication').closest('button'));
        
        expect(handleAddNew).toHaveBeenCalledTimes(1);
        expect(handleAddNew).toHaveBeenCalledWith();
    });

    it('should show the camera interface when "Use Camera" is clicked', async () => {
        // 1. Create a more realistic mock for the camera stream
        const mockStream = {
            getVideoTracks: () => [{ stop: vi.fn() }],
            getTracks: () => [{ stop: vi.fn() }],
        };
        global.navigator.mediaDevices = {
            getUserMedia: vi.fn().mockResolvedValue(mockStream)
        };
        
        render(<MedicationLogging medications={[]} />);
        
        expect(screen.queryByRole('button', { name: /Capture/i })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Use Camera/i }));

        // 2. Use 'await' with 'findByRole' to correctly handle the asynchronous update
        const captureButton = await screen.findByRole('button', { name: /Capture/i });
        expect(captureButton).toBeInTheDocument();
    });
});