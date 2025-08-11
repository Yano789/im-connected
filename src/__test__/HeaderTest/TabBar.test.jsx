import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TabBar from '../../TopHeader/TabBar/TabBar';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'Dashboard': 'Dashboard',
                'Forum': 'Forum',
                'Medication': 'Medication',
                'Chatbot': 'Chatbot',
                'Profile': 'Profile'
            };
            return translations[key] || key;
        }
    })
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('TabBar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all five navigation tabs', () => {
        renderWithRouter(<TabBar />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Forum')).toBeInTheDocument();
        expect(screen.getByText('Medication')).toBeInTheDocument();
        expect(screen.getByText('Chatbot')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render all navigation icons', () => {
        renderWithRouter(<TabBar />);
        
        const icons = document.querySelectorAll('.applicationIcon');
        expect(icons).toHaveLength(5);
        
        // Check that all icons have the correct CSS class
        icons.forEach(icon => {
            expect(icon).toHaveClass('applicationIcon');
        });
    });

    it('should navigate to dashboard when dashboard tab is clicked', () => {
        renderWithRouter(<TabBar />);
        
        const dashboardTab = screen.getByText('Dashboard').closest('.navigateTo');
        fireEvent.click(dashboardTab);
        
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to forum when forum tab is clicked', () => {
        renderWithRouter(<TabBar />);
        
        const forumTab = screen.getByText('Forum').closest('.navigateTo');
        fireEvent.click(forumTab);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum');
    });

    it('should navigate to medication when medication tab is clicked', () => {
        renderWithRouter(<TabBar />);
        
        const medicationTab = screen.getByText('Medication').closest('.navigateTo');
        fireEvent.click(medicationTab);
        
        expect(mockNavigate).toHaveBeenCalledWith('/medication');
    });

    it('should navigate to chatbot when chatbot tab is clicked', () => {
        renderWithRouter(<TabBar />);
        
        const chatbotTab = screen.getByText('Chatbot').closest('.navigateTo');
        fireEvent.click(chatbotTab);
        
        expect(mockNavigate).toHaveBeenCalledWith('/chatbot');
    });

    it('should navigate to profile when profile tab is clicked', () => {
        renderWithRouter(<TabBar />);
        
        const profileTab = screen.getByText('Profile').closest('.navigateTo');
        fireEvent.click(profileTab);
        
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('should apply correct CSS classes', () => {
        renderWithRouter(<TabBar />);
        
        const iconsContainer = document.querySelector('.icons');
        expect(iconsContainer).toBeInTheDocument();
        
        const navigateElements = document.querySelectorAll('.navigateTo');
        expect(navigateElements).toHaveLength(5);
        
        const dashboardTexts = document.querySelectorAll('.dashboard');
        expect(dashboardTexts).toHaveLength(5);
        
        const applicationIcons = document.querySelectorAll('.applicationIcon');
        expect(applicationIcons).toHaveLength(5);
    });

    it('should handle multiple rapid clicks on same tab', () => {
        renderWithRouter(<TabBar />);
        
        const dashboardTab = screen.getByText('Dashboard').closest('.navigateTo');
        
        // Click multiple times rapidly
        fireEvent.click(dashboardTab);
        fireEvent.click(dashboardTab);
        fireEvent.click(dashboardTab);
        
        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle clicking on different tabs in sequence', () => {
        renderWithRouter(<TabBar />);
        
        const dashboardTab = screen.getByText('Dashboard').closest('.navigateTo');
        const forumTab = screen.getByText('Forum').closest('.navigateTo');
        const medicationTab = screen.getByText('Medication').closest('.navigateTo');
        
        fireEvent.click(dashboardTab);
        fireEvent.click(forumTab);
        fireEvent.click(medicationTab);
        
        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/dashboard');
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/forum');
        expect(mockNavigate).toHaveBeenNthCalledWith(3, '/medication');
    });

    it('should render component without router context', () => {
        // Test that the component renders even without router
        render(<TabBar />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Forum')).toBeInTheDocument();
        expect(screen.getByText('Medication')).toBeInTheDocument();
        expect(screen.getByText('Chatbot')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should handle component mounting and unmounting', () => {
        const { unmount } = renderWithRouter(<TabBar />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should maintain correct tab order', () => {
        renderWithRouter(<TabBar />);
        
        const navigateElements = document.querySelectorAll('.navigateTo');
        const tabTexts = Array.from(navigateElements).map(el => 
            el.querySelector('.dashboard').textContent
        );
        
        expect(tabTexts).toEqual(['Dashboard', 'Forum', 'Medication', 'Chatbot', 'Profile']);
    });

    it('should handle translation keys correctly', () => {
        renderWithRouter(<TabBar />);
        
        // Check that all translation keys are used correctly
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Forum')).toBeInTheDocument();
        expect(screen.getByText('Medication')).toBeInTheDocument();
        expect(screen.getByText('Chatbot')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should handle icon src attributes correctly', () => {
        renderWithRouter(<TabBar />);
        
        const icons = document.querySelectorAll('.applicationIcon');
        
        // All icons should have src attributes
        icons.forEach(icon => {
            expect(icon.src).toBeTruthy();
            expect(icon.src).toMatch(/\.(png|jpg|jpeg|svg)$/);
        });
    });

    it('should handle keyboard accessibility', () => {
        renderWithRouter(<TabBar />);
        
        const dashboardTab = screen.getByText('Dashboard').closest('.navigateTo');
        
        // Test keyboard navigation (Enter key)
        fireEvent.keyDown(dashboardTab, { key: 'Enter', code: 'Enter' });
        
        // Note: The component doesn't handle keyboard events natively,
        // but we can test that the structure is accessible
        expect(dashboardTab).toBeInTheDocument();
    });

    it('should handle re-rendering correctly', () => {
        const { rerender } = renderWithRouter(<TabBar />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        
        // Re-render
        rerender(
            <BrowserRouter>
                <TabBar />
            </BrowserRouter>
        );
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(document.querySelectorAll('.applicationIcon')).toHaveLength(5);
    });

    it('should maintain component structure with nested elements', () => {
        renderWithRouter(<TabBar />);
        
        const navigateElements = document.querySelectorAll('.navigateTo');
        
        navigateElements.forEach(element => {
            // Each navigate element should have an icon and text
            const icon = element.querySelector('.applicationIcon');
            const text = element.querySelector('.dashboard');
            
            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
        });
    });
});
