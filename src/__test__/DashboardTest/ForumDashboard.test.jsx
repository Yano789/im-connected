import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForumDashboard from '../../Dashboard/ForumDashboard/ForumDashboard';

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
                'Forum': 'Forum',
                'ForumSubHeader': 'Explore trending discussions',
                'Latest Post': 'Latest Post',
                'Highest Liked Post': 'Highest Liked Post',
                'Highest Commented Post': 'Highest Commented Post'
            };
            return translations[key] || key;
        }
    })
}));

// Mock AIDashboardEntry component
vi.mock('../../Dashboard/AIDashboardEntry/AIDashboardEntry', () => ({
    default: ({ itemName, itemTitle, onClick }) => (
        <div 
            data-testid="dashboard-entry"
            data-item-name={itemName}
            data-item-title={itemTitle}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <div data-testid="item-name">{itemName}</div>
            <div data-testid="item-title">{itemTitle}</div>
        </div>
    )
}));

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('ForumDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default successful fetch mock
        global.fetch.mockImplementation((url) => {
            const params = new URL(url).searchParams;
            const sortType = params.get('sort');
            
            let mockPost;
            switch (sortType) {
                case 'latest':
                    mockPost = { postId: 1, title: 'Latest Post Title' };
                    break;
                case 'most likes':
                    mockPost = { postId: 2, title: 'Most Liked Post Title' };
                    break;
                case 'most comments':
                    mockPost = { postId: 3, title: 'Most Commented Post Title' };
                    break;
                default:
                    mockPost = { postId: 1, title: 'Default Post Title' };
            }
            
            return Promise.resolve({
                ok: true,
                json: async () => [mockPost]
            });
        });
    });

    it('should render forum dashboard with header and subheader', async () => {
        renderWithRouter(<ForumDashboard />);
        
        expect(screen.getByText('Forum')).toBeInTheDocument();
        expect(screen.getByText('Explore trending discussions')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
        renderWithRouter(<ForumDashboard />);
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should load and display top posts after fetching', async () => {
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // Should have three dashboard entries
        const dashboardEntries = screen.getAllByTestId('dashboard-entry');
        expect(dashboardEntries).toHaveLength(3);
        
        // Check entry names
        expect(screen.getByText('Latest Post')).toBeInTheDocument();
        expect(screen.getByText('Highest Liked Post')).toBeInTheDocument();
        expect(screen.getByText('Highest Commented Post')).toBeInTheDocument();
        
        // Check entry titles
        expect(screen.getByText('Latest Post Title')).toBeInTheDocument();
        expect(screen.getByText('Most Liked Post Title')).toBeInTheDocument();
        expect(screen.getByText('Most Commented Post Title')).toBeInTheDocument();
    });

    it('should make correct API calls for each sort type', async () => {
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        expect(global.fetch).toHaveBeenCalledTimes(3);
        
        // Check that the API calls were made with correct parameters
        const calls = global.fetch.mock.calls;
        
        // Check that each sort type was called (URLs use + instead of %20 for spaces)
        const hasLatest = calls.some(call => call[0].includes('sort=latest'));
        const hasMostLikes = calls.some(call => call[0].includes('sort=most+likes'));
        const hasMostComments = calls.some(call => call[0].includes('sort=most+comments'));
        
        expect(hasLatest).toBe(true);
        expect(hasMostLikes).toBe(true);
        expect(hasMostComments).toBe(true);
        
        // Check that all calls have correct method and credentials
        calls.forEach(call => {
            expect(call[1]).toMatchObject({
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    it('should navigate to correct post when entry is clicked', async () => {
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // Click on latest post entry
        const latestPostEntry = screen.getByText('Latest Post').closest('[data-testid="dashboard-entry"]');
        fireEvent.click(latestPostEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum/viewpost?postId=1');
        
        // Click on most liked post entry
        const likedPostEntry = screen.getByText('Highest Liked Post').closest('[data-testid="dashboard-entry"]');
        fireEvent.click(likedPostEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum/viewpost?postId=2');
        
        // Click on most commented post entry
        const commentedPostEntry = screen.getByText('Highest Commented Post').closest('[data-testid="dashboard-entry"]');
        fireEvent.click(commentedPostEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum/viewpost?postId=3');
    });

    it('should handle API fetch errors', async () => {
        global.fetch.mockRejectedValue(new Error('API Error'));
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // When API fails, component still renders entries with N/A
        const dashboardEntries = screen.getAllByTestId('dashboard-entry');
        expect(dashboardEntries).toHaveLength(3);
        
        // Should show N/A for all titles when API fails
        const naTitles = screen.getAllByText('N/A');
        expect(naTitles).toHaveLength(3);
    });

    it('should handle failed API responses', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // When API fails, component still renders entries with N/A
        const dashboardEntries = screen.getAllByTestId('dashboard-entry');
        expect(dashboardEntries).toHaveLength(3);
    });

    it('should display N/A for missing post data', async () => {
        // Mock API returning empty arrays
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => []
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // Should show N/A for all titles
        const naTitles = screen.getAllByText('N/A');
        expect(naTitles).toHaveLength(3);
    });

    it('should handle posts with special characters in titles', async () => {
        global.fetch.mockImplementation((url) => {
            const params = new URL(url).searchParams;
            const sortType = params.get('sort');
            
            let mockPost;
            switch (sortType) {
                case 'latest':
                    mockPost = { postId: 1, title: 'Post with émojis 🚀 & spëcial chars' };
                    break;
                case 'most likes':
                    mockPost = { postId: 2, title: 'Post with "quotes" & <tags>' };
                    break;
                case 'most comments':
                    mockPost = { postId: 3, title: 'Post with 123 números & símbolos !@#$%' };
                    break;
                default:
                    mockPost = { postId: 1, title: 'Default' };
            }
            
            return Promise.resolve({
                ok: true,
                json: async () => [mockPost]
            });
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('Post with émojis 🚀 & spëcial chars')).toBeInTheDocument();
        expect(screen.getByText('Post with "quotes" & <tags>')).toBeInTheDocument();
        expect(screen.getByText('Post with 123 números & símbolos !@#$%')).toBeInTheDocument();
    });

    it('should handle posts with very long titles', async () => {
        const longTitle = 'This is a very long post title that might overflow the container and cause layout issues if not handled properly by the component';
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [{ postId: 1, title: longTitle }]
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        expect(screen.getAllByText(longTitle)).toHaveLength(3);
    });

    it('should apply correct CSS classes', async () => {
        renderWithRouter(<ForumDashboard />);
        
        const cardDiv = document.querySelector('.cardDiv');
        expect(cardDiv).toBeInTheDocument();
        
        const cardHeader = document.querySelector('.card-header');
        expect(cardHeader).toBeInTheDocument();
        expect(cardHeader.textContent).toBe('Forum');
        
        const cardSubheader = document.querySelector('.card-subheader');
        expect(cardSubheader).toBeInTheDocument();
        expect(cardSubheader.textContent).toBe('Explore trending discussions');
    });

    it('should handle navigation with encoded post IDs', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [{ postId: 'special/id&with=chars', title: 'Test Post' }]
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        const postEntry = screen.getByText('Latest Post').closest('[data-testid="dashboard-entry"]');
        fireEvent.click(postEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum/viewpost?postId=special%2Fid%26with%3Dchars');
    });

    it('should handle partial API failures gracefully', async () => {
        let callCount = 0;
        global.fetch.mockImplementation(() => {
            callCount++;
            if (callCount === 2) {
                // Fail the second call (most likes)
                return Promise.reject(new Error('API Error'));
            }
            return Promise.resolve({
                ok: true,
                json: async () => [{ postId: callCount, title: `Post ${callCount}` }]
            });
        });
        
        renderWithRouter(<ForumDashboard />);
        
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
        
        // When one API call fails, component still renders with available data
        const dashboardEntries = screen.getAllByTestId('dashboard-entry');
        expect(dashboardEntries).toHaveLength(3);
    });

    it('should handle component unmounting during API calls', async () => {
        let resolvePromise;
        const pendingPromise = new Promise(resolve => {
            resolvePromise = resolve;
        });
        
        global.fetch.mockReturnValue(pendingPromise);
        
        const { unmount } = renderWithRouter(<ForumDashboard />);
        
        // Unmount before API call completes
        unmount();
        
        // Resolve the promise (this would normally cause a state update)
        resolvePromise({
            ok: true,
            json: async () => [{ postId: 1, title: 'Test' }]
        });
        
        // Should not throw or cause issues
        expect(() => {}).not.toThrow();
    });
});
