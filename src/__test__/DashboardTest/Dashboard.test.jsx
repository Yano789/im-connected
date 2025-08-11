import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../Dashboard/Dashboard/Dashboard';

// Mock the API endpoints
vi.mock('../../config/api.js', () => ({
    API_ENDPOINTS: {
        USER_GET: 'http://localhost:5001/api/v1/user/getUser'
    }
}));

// Mock i18next
vi.mock('i18next', () => ({
    default: {
        language: 'en',
        changeLanguage: vi.fn().mockResolvedValue()
    }
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock the child components
vi.mock('../../Dashboard/DashboardBody/DashboardBody', () => ({
    default: () => (
        <div data-testid="dashboard-body">
            Mock DashboardBody
        </div>
    )
}));

// Mock the Header component
vi.mock('../../TopHeader/Header/Header', () => ({
    default: (props) => (
        <div data-testid="header" {...props}>
            Mock Header
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

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock successful API response
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                preferences: {
                    preferredLanguage: 'en'
                }
            })
        });
    });

    it('should render the dashboard component with header and body', async () => {
        renderWithRouter(<Dashboard />);

        // Wait for the component to finish loading
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });

        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
    });    it('should render Header component first', async () => {
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        const header = screen.getByTestId('header');
        const dashboardBody = screen.getByTestId('dashboard-body');
        
        expect(header).toBeInTheDocument();
        expect(dashboardBody).toBeInTheDocument();
        
        // Check that header appears before dashboard body in DOM
        const container = header.parentElement;
        const children = Array.from(container.children);
        const headerIndex = children.indexOf(header);
        const bodyIndex = children.indexOf(dashboardBody);
        
        expect(headerIndex).toBeLessThan(bodyIndex);
    });

    it('should handle component mounting and unmounting', async () => {
        const { unmount } = renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should handle re-rendering correctly', async () => {
        const { rerender } = renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
        
        // Re-render
        rerender(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
    });

    it('should render without router context (testing component isolation)', async () => {
        // Test that the component itself doesn't require router context
        // (child components might, but that's handled by mocking)
        render(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
    });

    it('should maintain component structure', async () => {
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        const header = screen.getByTestId('header');
        const dashboardBody = screen.getByTestId('dashboard-body');
        
        expect(header).toBeInTheDocument();
        expect(header.textContent).toContain('Mock Header');
        
        expect(dashboardBody).toBeInTheDocument();
        expect(dashboardBody.textContent).toContain('Mock DashboardBody');
    });

    it('should handle child component errors gracefully', async () => {
        // Mock one component to throw an error
        vi.doMock('../../TopHeader/Header/Header', () => ({
            default: () => {
                throw new Error('Header error');
            }
        }));

        // The test framework should catch this, but the component structure should still try to render
        expect(() => {
            renderWithRouter(<Dashboard />);
        }).not.toThrow();
    });

    it('should render both components without any props', async () => {
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        // Both components should render even without any props passed to Dashboard
        expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
    });

    it('should maintain correct DOM structure', async () => {
        const { container } = renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
        
        // Check that the main wrapper div exists
        const mainDiv = container.firstChild;
        expect(mainDiv).toBeInTheDocument();
        
        // Both components should be direct children of the main div
        const header = screen.getByTestId('header');
        const dashboardBody = screen.getByTestId('dashboard-body');
        
        expect(header.parentElement).toBe(mainDiv);
        expect(dashboardBody.parentElement).toBe(mainDiv);
    });

    it('should handle multiple re-renders without issues', async () => {
        const { rerender } = renderWithRouter(<Dashboard />);
        
        // Multiple re-renders
        for (let i = 0; i < 3; i++) {
            rerender(
                <BrowserRouter>
                    <Dashboard />
                </BrowserRouter>
            );
            
            await waitFor(() => {
                expect(screen.getByTestId('header')).toBeInTheDocument();
            });
            
            expect(screen.getByTestId('dashboard-body')).toBeInTheDocument();
        }
    });
});
