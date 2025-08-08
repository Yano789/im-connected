import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardBody from '../../Dashboard/DashboardBody/DashboardBody';

// Mock the dashboard components
vi.mock('../../Dashboard/AIDashboard/AIDashboard', () => ({
    default: () => <div data-testid="ai-dashboard">Mock AIDashboard</div>
}));

vi.mock('../../Dashboard/MedDashboard/MedDashboard', () => ({
    default: () => <div data-testid="med-dashboard">Mock MedDashboard</div>
}));

vi.mock('../../Dashboard/ForumDashboard/ForumDashboard', () => ({
    default: () => <div data-testid="forum-dashboard">Mock ForumDashboard</div>
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('DashboardBody Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the dashboard body with all three dashboard components', () => {
        renderWithRouter(<DashboardBody />);
        
        expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('med-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('forum-dashboard')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for dashboard structure', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardDiv = document.querySelector('.dashboard-div');
        expect(dashboardDiv).toBeInTheDocument();
        
        const dashboardGrid = document.querySelector('.dashboard-grid');
        expect(dashboardGrid).toBeInTheDocument();
        
        const dashboardItems = document.querySelectorAll('.dashboardItem');
        expect(dashboardItems).toHaveLength(3);
    });

    it('should render MedDashboard in the first dashboard item', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardItems = document.querySelectorAll('.dashboardItem');
        const firstItem = dashboardItems[0];
        
        expect(firstItem.querySelector('[data-testid="med-dashboard"]')).toBeInTheDocument();
    });

    it('should render ForumDashboard in the second dashboard item', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardItems = document.querySelectorAll('.dashboardItem');
        const secondItem = dashboardItems[1];
        
        expect(secondItem.querySelector('[data-testid="forum-dashboard"]')).toBeInTheDocument();
    });

    it('should render AIDashboard in the third dashboard item', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardItems = document.querySelectorAll('.dashboardItem');
        const thirdItem = dashboardItems[2];
        
        expect(thirdItem.querySelector('[data-testid="ai-dashboard"]')).toBeInTheDocument();
    });

    it('should maintain correct dashboard order (Med, Forum, AI)', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardItems = document.querySelectorAll('.dashboardItem');
        
        // Verify order by checking which component is in each position
        expect(dashboardItems[0].querySelector('[data-testid="med-dashboard"]')).toBeInTheDocument();
        expect(dashboardItems[1].querySelector('[data-testid="forum-dashboard"]')).toBeInTheDocument();
        expect(dashboardItems[2].querySelector('[data-testid="ai-dashboard"]')).toBeInTheDocument();
    });

    it('should handle component mounting and unmounting', () => {
        const { unmount } = renderWithRouter(<DashboardBody />);
        
        expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('med-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('forum-dashboard')).toBeInTheDocument();
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should handle re-rendering correctly', () => {
        const { rerender } = renderWithRouter(<DashboardBody />);
        
        expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('med-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('forum-dashboard')).toBeInTheDocument();
        
        // Re-render
        rerender(
            <BrowserRouter>
                <DashboardBody />
            </BrowserRouter>
        );
        
        expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('med-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('forum-dashboard')).toBeInTheDocument();
    });

    it('should render dashboard grid structure correctly', () => {
        renderWithRouter(<DashboardBody />);
        
        const dashboardDiv = document.querySelector('.dashboard-div');
        expect(dashboardDiv).toBeInTheDocument();
        
        const dashboardGrid = dashboardDiv.querySelector('.dashboard-grid');
        expect(dashboardGrid).toBeInTheDocument();
        
        // All dashboard items should be direct children of dashboard-grid
        const gridChildren = dashboardGrid.children;
        expect(gridChildren).toHaveLength(3);
        
        Array.from(gridChildren).forEach(child => {
            expect(child).toHaveClass('dashboardItem');
        });
    });

    it('should ensure all dashboard components are rendered within their containers', () => {
        renderWithRouter(<DashboardBody />);
        
        // Check that each dashboard component is properly contained
        const medDashboard = screen.getByTestId('med-dashboard');
        const forumDashboard = screen.getByTestId('forum-dashboard');
        const aiDashboard = screen.getByTestId('ai-dashboard');
        
        // Each should be inside a dashboardItem
        expect(medDashboard.closest('.dashboardItem')).toBeInTheDocument();
        expect(forumDashboard.closest('.dashboardItem')).toBeInTheDocument();
        expect(aiDashboard.closest('.dashboardItem')).toBeInTheDocument();
    });

    it('should maintain dashboard layout structure', () => {
        renderWithRouter(<DashboardBody />);
        
        // Verify the complete structure hierarchy
        const dashboardDiv = document.querySelector('.dashboard-div');
        const dashboardGrid = dashboardDiv.querySelector('.dashboard-grid');
        const dashboardItems = dashboardGrid.querySelectorAll('.dashboardItem');
        
        expect(dashboardDiv).toBeInTheDocument();
        expect(dashboardGrid).toBeInTheDocument();
        expect(dashboardItems).toHaveLength(3);
        
        // Each dashboard item should contain exactly one dashboard component
        dashboardItems.forEach(item => {
            const dashboardComponents = item.querySelectorAll('[data-testid*="dashboard"]');
            expect(dashboardComponents).toHaveLength(1);
        });
    });

    it('should render without router context (testing component isolation)', () => {
        // Test that the component itself doesn't require router context
        // (child components might, but that's handled by mocking)
        render(<DashboardBody />);
        
        expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('med-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('forum-dashboard')).toBeInTheDocument();
    });

    it('should handle component errors gracefully', () => {
        // Mock one component to throw an error
        vi.doMock('../../Dashboard/AIDashboard/AIDashboard', () => ({
            default: () => {
                throw new Error('Test error');
            }
        }));

        // The test framework should catch this, but the component structure should still render
        expect(() => {
            renderWithRouter(<DashboardBody />);
        }).not.toThrow();
    });
});
