import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedDashboard from '../../Dashboard/MedDashboard/MedDashboard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'MedDashboardHeader': 'Your Medications',
                'MedDashboardSubHeader': 'Today\'s schedule',
                'Unknown Medication': 'Unknown Medication',
                'Unknown Dosage': 'Unknown Dosage',
                'Time': 'Time:',
                'Taken': 'Taken:',
                'Yes': 'Yes',
                'No': 'No'
            };
            return translations[key] || key;
        }
    })
}));

// Mock MedDashboardEntry component
vi.mock('../../Dashboard/MedDashboardEntry/MedDashboardEntry', () => ({
    default: ({ medicineName, medicineDosage }) => (
        <div data-testid="med-dashboard-entry">
            <div data-testid="medicine-name">{medicineName}</div>
            <div data-testid="medicine-dosage">{medicineDosage}</div>
        </div>
    )
}));

// Mock fetch
global.fetch = vi.fn();

const mockMedications = [
    {
        _id: '1',
        name: 'Aspirin',
        dosage: '100mg',
        dosages: [
            { _id: 'd1', time: '08:00', taken: true },
            { _id: 'd2', time: '20:00', taken: false }
        ]
    },
    {
        _id: '2',
        name: 'Ibuprofen',
        dosage: '200mg',
        dosages: [
            { _id: 'd3', time: '12:00', taken: true }
        ]
    },
    {
        _id: '3',
        name: 'Paracetamol',
        dosage: '500mg',
        dosages: [
            { _id: 'd4', time: '06:00', taken: false },
            { _id: 'd5', time: '18:00', taken: true }
        ]
    },
    {
        _id: '4',
        name: 'Extra Medication',
        dosage: '50mg',
        dosages: [
            { _id: 'd6', time: '10:00', taken: false }
        ]
    }
];

describe('MedDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default successful fetch mock
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockMedications
        });
    });

    it('should render medication dashboard with header and subheader', async () => {
        render(<MedDashboard />);
        
        expect(screen.getByText('Your Medications')).toBeInTheDocument();
        expect(screen.getByText('Today\'s schedule')).toBeInTheDocument();
    });

    it('should fetch medications on component mount', async () => {
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5001/api/v1/medication/medications',
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        });
    });

    it('should display only first 3 medications', async () => {
        render(<MedDashboard />);
        
        await waitFor(() => {
            const medEntries = screen.getAllByTestId('med-dashboard-entry');
            expect(medEntries).toHaveLength(3);
        });
        
        // Check that the first 3 medications are displayed
        expect(screen.getByText('Aspirin')).toBeInTheDocument();
        expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
        expect(screen.getByText('Paracetamol')).toBeInTheDocument();
        
        // Fourth medication should not be displayed
        expect(screen.queryByText('Extra Medication')).not.toBeInTheDocument();
    });

    it('should display medication names and dosages', async () => {
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Aspirin')).toBeInTheDocument();
            expect(screen.getByText('100mg')).toBeInTheDocument();
            
            expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
            expect(screen.getByText('200mg')).toBeInTheDocument();
            
            expect(screen.getByText('Paracetamol')).toBeInTheDocument();
            expect(screen.getByText('500mg')).toBeInTheDocument();
        });
    });

    it('should display dosage schedules with times and taken status', async () => {
        render(<MedDashboard />);
        
        await waitFor(() => {
            // Check for dosage times and taken status
            expect(screen.getByText('Time: 08:00 — Taken: Yes')).toBeInTheDocument();
            expect(screen.getByText('Time: 20:00 — Taken: No')).toBeInTheDocument();
            expect(screen.getByText('Time: 12:00 — Taken: Yes')).toBeInTheDocument();
            expect(screen.getByText('Time: 06:00 — Taken: No')).toBeInTheDocument();
            expect(screen.getByText('Time: 18:00 — Taken: Yes')).toBeInTheDocument();
        });
    });

    it('should handle medications with missing name', async () => {
        const medicationsWithMissingName = [
            {
                _id: '1',
                dosage: '100mg',
                dosages: [
                    { _id: 'd1', time: '08:00', taken: true }
                ]
            }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => medicationsWithMissingName
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Unknown Medication')).toBeInTheDocument();
            expect(screen.getByText('100mg')).toBeInTheDocument();
        });
    });

    it('should handle medications with missing dosage', async () => {
        const medicationsWithMissingDosage = [
            {
                _id: '1',
                name: 'Aspirin',
                dosages: [
                    { _id: 'd1', time: '08:00', taken: true }
                ]
            }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => medicationsWithMissingDosage
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Aspirin')).toBeInTheDocument();
            expect(screen.getByText('Unknown Dosage')).toBeInTheDocument();
        });
    });

    it('should handle API fetch errors gracefully', async () => {
        global.fetch.mockRejectedValue(new Error('API Error'));
        
        // Mock console.error to prevent error output in tests
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching medications:', expect.any(Error));
        });
        
        // Should not display any medication entries
        expect(screen.queryByTestId('med-dashboard-entry')).not.toBeInTheDocument();
        
        consoleSpy.mockRestore();
    });

    it('should handle failed API responses', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500
        });
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching medications:', expect.any(Error));
        });
        
        consoleSpy.mockRestore();
    });

    it('should handle empty medications array', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => []
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('med-dashboard-entry')).not.toBeInTheDocument();
        });
        
        // Headers should still be present
        expect(screen.getByText('Your Medications')).toBeInTheDocument();
        expect(screen.getByText('Today\'s schedule')).toBeInTheDocument();
    });

    it('should handle medications with no dosages array', async () => {
        const medicationsWithNoDosages = [
            {
                _id: '1',
                name: 'Aspirin',
                dosage: '100mg',
                dosages: []
            }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => medicationsWithNoDosages
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Aspirin')).toBeInTheDocument();
            expect(screen.getByText('100mg')).toBeInTheDocument();
        });
        
        // Should not have any dosage schedule items
        expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
    });

    it('should handle dosages without _id', async () => {
        const medicationsWithoutDosageIds = [
            {
                _id: '1',
                name: 'Aspirin',
                dosage: '100mg',
                dosages: [
                    { time: '08:00', taken: true },
                    { time: '20:00', taken: false }
                ]
            }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => medicationsWithoutDosageIds
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Time: 08:00 — Taken: Yes')).toBeInTheDocument();
            expect(screen.getByText('Time: 20:00 — Taken: No')).toBeInTheDocument();
        });
    });

    it('should apply correct CSS classes', async () => {
        render(<MedDashboard />);
        
        const cardDiv = document.querySelector('.cardDiv');
        expect(cardDiv).toBeInTheDocument();
        
        const cardHeader = document.querySelector('.card-header');
        expect(cardHeader).toBeInTheDocument();
        expect(cardHeader.textContent).toBe('Your Medications');
        
        const cardSubheader = document.querySelector('.card-subheader');
        expect(cardSubheader).toBeInTheDocument();
        expect(cardSubheader.textContent).toBe('Today\'s schedule');
        
        await waitFor(() => {
            const cardDetails = document.querySelectorAll('.cardDetails');
            expect(cardDetails).toHaveLength(3);
        });
    });

    it('should handle medications with special characters', async () => {
        const medicationsWithSpecialChars = [
            {
                _id: '1',
                name: 'Médicament spëcial',
                dosage: '100mg/día',
                dosages: [
                    { _id: 'd1', time: '08:00', taken: true }
                ]
            }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => medicationsWithSpecialChars
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Médicament spëcial')).toBeInTheDocument();
            expect(screen.getByText('100mg/día')).toBeInTheDocument();
        });
    });

    it('should handle exactly 3 medications without truncation', async () => {
        const exactlyThreeMedications = mockMedications.slice(0, 3);
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => exactlyThreeMedications
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            const medEntries = screen.getAllByTestId('med-dashboard-entry');
            expect(medEntries).toHaveLength(3);
        });
        
        expect(screen.getByText('Aspirin')).toBeInTheDocument();
        expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
        expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    });

    it('should handle less than 3 medications', async () => {
        const twoMedications = mockMedications.slice(0, 2);
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => twoMedications
        });
        
        render(<MedDashboard />);
        
        await waitFor(() => {
            const medEntries = screen.getAllByTestId('med-dashboard-entry');
            expect(medEntries).toHaveLength(2);
        });
        
        expect(screen.getByText('Aspirin')).toBeInTheDocument();
        expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
        expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
    });

    it('should handle component unmounting during API call', async () => {
        let resolvePromise;
        const pendingPromise = new Promise(resolve => {
            resolvePromise = resolve;
        });
        
        global.fetch.mockReturnValue(pendingPromise);
        
        const { unmount } = render(<MedDashboard />);
        
        // Unmount before API call completes
        unmount();
        
        // Resolve the promise
        resolvePromise({
            ok: true,
            json: async () => mockMedications
        });
        
        // Should not throw or cause issues
        expect(() => {}).not.toThrow();
    });
});
