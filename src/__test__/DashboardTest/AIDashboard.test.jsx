import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AIDashboard from '../../Dashboard/AIDashboard/AIDashboard';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'AIDashboardHeader': 'AI Assistant',
                'AIDashboardSubHeader': 'Get help with health questions',
                'AIDashboardEntry1': 'Ask Health Questions',
                'AIDashboardEntry2': 'Medication Guidance',
                'AIDashboardEntry3': 'Symptom Checker'
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock('../../Dashboard/AIDashboardEntry/AIDashboardEntry', () => ({
    default: ({ itemName, onClick }) => (
        <div 
            data-testid="ai-dashboard-entry" 
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            {itemName}
        </div>
    )
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('AIDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the dashboard with header and subheader', () => {
        renderWithRouter(<AIDashboard />);
        
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
        expect(screen.getByText('Get help with health questions')).toBeInTheDocument();
    });

    it('should render all three AI dashboard entries', () => {
        renderWithRouter(<AIDashboard />);
        
        expect(screen.getByText('Ask Health Questions')).toBeInTheDocument();
        expect(screen.getByText('Medication Guidance')).toBeInTheDocument();
        expect(screen.getByText('Symptom Checker')).toBeInTheDocument();
        
        const entries = screen.getAllByTestId('ai-dashboard-entry');
        expect(entries).toHaveLength(3);
    });

    it('should navigate to chatbot when first entry is clicked', () => {
        renderWithRouter(<AIDashboard />);
        
        const firstEntry = screen.getByText('Ask Health Questions');
        fireEvent.click(firstEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/chatbot');
    });

    it('should navigate to chatbot when second entry is clicked', () => {
        renderWithRouter(<AIDashboard />);
        
        const secondEntry = screen.getByText('Medication Guidance');
        fireEvent.click(secondEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/chatbot');
    });

    it('should navigate to chatbot when third entry is clicked', () => {
        renderWithRouter(<AIDashboard />);
        
        const thirdEntry = screen.getByText('Symptom Checker');
        fireEvent.click(thirdEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/chatbot');
    });

    it('should have correct CSS classes applied', () => {
        renderWithRouter(<AIDashboard />);
        
        const container = screen.getByText('AI Assistant').closest('.cardDiv');
        expect(container).toBeInTheDocument();
        
        const header = screen.getByText('AI Assistant');
        expect(header).toHaveClass('card-header');
        
        const subheader = screen.getByText('Get help with health questions');
        expect(subheader).toHaveClass('card-subheader');
    });

    it('should handle multiple clicks without issues', () => {
        renderWithRouter(<AIDashboard />);
        
        const firstEntry = screen.getByText('Ask Health Questions');
        const secondEntry = screen.getByText('Medication Guidance');
        
        fireEvent.click(firstEntry);
        fireEvent.click(secondEntry);
        fireEvent.click(firstEntry);
        
        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/chatbot');
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/chatbot');
        expect(mockNavigate).toHaveBeenNthCalledWith(3, '/chatbot');
    });

    it('should render entries in correct order', () => {
        renderWithRouter(<AIDashboard />);
        
        const entries = screen.getAllByTestId('ai-dashboard-entry');
        expect(entries[0]).toHaveTextContent('Ask Health Questions');
        expect(entries[1]).toHaveTextContent('Medication Guidance');
        expect(entries[2]).toHaveTextContent('Symptom Checker');
    });

    it('should use translation keys correctly', () => {
        renderWithRouter(<AIDashboard />);
        
        // Check that translation function is called correctly
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
        expect(screen.getByText('Get help with health questions')).toBeInTheDocument();
        expect(screen.getByText('Ask Health Questions')).toBeInTheDocument();
        expect(screen.getByText('Medication Guidance')).toBeInTheDocument();
        expect(screen.getByText('Symptom Checker')).toBeInTheDocument();
    });
});
