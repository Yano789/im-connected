import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../TopHeader/Header/Header';
import { AuthContext } from '../../AuthContext';

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
                'im': 'im',
                'Connected': 'Connected',
                'Search': 'Search',
                'No Forum Posts': 'No forum posts with this title',
                'Sign Out': 'Sign Out'
            };
            return translations[key] || key;
        }
    })
}));

// Mock the API endpoints
vi.mock('../../config/api.js', () => ({
    API_ENDPOINTS: {
        USER_LOGOUT: 'http://localhost:5001/api/v1/user/logout',
        POST_SEARCH: (searchTerm) => `http://localhost:5001/api/v1/post/getPost/search/${encodeURIComponent(searchTerm)}`
    }
}));

// Mock i18next
vi.mock('i18next', () => ({
    default: {
        changeLanguage: vi.fn().mockResolvedValue()
    }
}));

// Mock TabBar component
vi.mock('../../TopHeader/TabBar/TabBar', () => ({
    default: () => <div data-testid="tab-bar">Mock TabBar</div>
}));

// Mock fetch
global.fetch = vi.fn();

const mockAuthContext = {
    setUser: vi.fn(),
    user: { id: 1, username: 'testuser' }
};

const renderWithRouter = (component, authContextValue = mockAuthContext) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={authContextValue}>
                {component}
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default search API mock
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                { postId: 1, title: 'Test Post 1' },
                { postId: 2, title: 'Test Post 2' }
            ]
        });
    });

    it('should render header with logo and site name', () => {
        renderWithRouter(<Header />);
        
        expect(screen.getByText('im')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();
        
        const logoImg = document.querySelector('.sitelogo .applicationIcon');
        expect(logoImg).toBeInTheDocument();
        expect(logoImg).toHaveAttribute('src');
    });

    it('should render search input with placeholder', () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveClass('typeHereTo');
    });

    it('should render TabBar component', () => {
        renderWithRouter(<Header />);
        
        expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
    });

    it('should render Sign Out button', () => {
        renderWithRouter(<Header />);
        
        const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
        expect(signOutButton).toBeInTheDocument();
        expect(signOutButton).toHaveClass('buttonStyle1');
    });

    it('should handle search input changes', async () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.change(searchInput, { target: { value: 'test search' } });
        
        // Wait for debounced search
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('search/test%20search'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
        }, { timeout: 500 });
    });

    it('should display search results when focused and typing', async () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        // Focus and type
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        await waitFor(() => {
            // Check for search dropdown and entries
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(2);
            
            // Check that results contain the expected text (even if split by highlighting)
            const firstEntry = searchEntries[0];
            const secondEntry = searchEntries[1];
            
            expect(firstEntry.textContent).toContain('Test Post 1');
            expect(secondEntry.textContent).toContain('Test Post 2');
        });
    });

    it('should navigate to post when search result is clicked', async () => {
        // Mock data where the search term matches the title (to get clickable results)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                { postId: 1, title: 'Test Post 1' }
            ]
        });
        
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        // Wait for debounced search to complete (300ms + some buffer)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        }, { timeout: 500 });
        
        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });
        
        // Wait for the search results to be rendered
        await waitFor(() => {
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries.length).toBeGreaterThan(0);
        });
        
        // Get the search entry that should have a click handler (because it matches the search)
        const searchEntries = document.querySelectorAll('.searchEntry');
        const clickableEntry = searchEntries[0];
        
        fireEvent.click(clickableEntry);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forum/viewpost?postId=1');
    });

    it('should highlight search matches in results', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                { postId: 1, title: 'Test Post About Testing' }
            ]
        });
        
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        await waitFor(() => {
            // Check for search dropdown and entries
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(1);
            
            // Check that the result contains the expected highlighted text
            const firstEntry = searchEntries[0];
            expect(firstEntry.textContent).toContain('Test Post About Testing');
        });
    });

    it('should show "No forum posts" when no search results', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => []
        });
        
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        
        await waitFor(() => {
            // Check for search dropdown first
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(1);
            
            // Check for the specific "No forum posts" message
            expect(searchEntries[0].textContent).toContain('No forum posts with this title');
        });
    });

    it('should handle search API errors', async () => {
        global.fetch.mockRejectedValue(new Error('Search API Error'));
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        await waitFor(() => {
            // Check for search dropdown first  
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(1);
            
            // Should show "No forum posts" message on error
            expect(searchEntries[0].textContent).toContain('No forum posts with this title');
        });
        
        consoleSpy.mockRestore();
    });

    it('should hide search dropdown when input loses focus', async () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        await waitFor(() => {
            // Check for search dropdown and the specific entries
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(2);
            
            // Check that the first result was removed from DOM after blur
            expect(searchEntries[0].textContent).toContain('Test Post 1');
        });
        
        // Blur the input
        await act(async () => {
            fireEvent.blur(searchInput);
            // Wait for the timeout in the component
            await new Promise(resolve => setTimeout(resolve, 200));
        });
        
        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).not.toBeInTheDocument();
        });
    });

    it('should not show search dropdown for empty search', () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        
        // Should not show dropdown without text
        expect(screen.queryByText('No forum posts with this title')).not.toBeInTheDocument();
    });

    it('should handle logout successfully', async () => {
        global.fetch.mockResolvedValue({
            ok: true
        });
        
        renderWithRouter(<Header />);
        
        const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
        fireEvent.click(signOutButton);
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5001/api/v1/user/logout',
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
        });
        
        expect(mockAuthContext.setUser).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should handle logout failure', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500
        });
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        renderWithRouter(<Header />);
        
        const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
        fireEvent.click(signOutButton);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Logout failed');
        });
        
        // Should not navigate or set user to null on failure
        expect(mockAuthContext.setUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
    });

    it('should handle logout network error', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        renderWithRouter(<Header />);
        
        const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
        fireEvent.click(signOutButton);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
        });
        
        consoleSpy.mockRestore();
    });

    it('should apply correct CSS classes', () => {
        renderWithRouter(<Header />);
        
        expect(document.querySelector('.header')).toBeInTheDocument();
        expect(document.querySelector('.headerMain')).toBeInTheDocument();
        expect(document.querySelector('.sitelogo')).toBeInTheDocument();
        expect(document.querySelector('.search')).toBeInTheDocument();
        expect(document.querySelector('.imconnected')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        // Type rapidly
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 't' } });
        fireEvent.change(searchInput, { target: { value: 'te' } });
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        // Should only make one API call after debounce
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        }, { timeout: 500 });
    });

    it('should limit search results to 3 items', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                { postId: 1, title: 'Post 1' },
                { postId: 2, title: 'Post 2' },
                { postId: 3, title: 'Post 3' },
                { postId: 4, title: 'Post 4' },
                { postId: 5, title: 'Post 5' }
            ]
        });
        
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'post' } });
        
        await waitFor(() => {
            // Check for search dropdown and entries
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            const searchEntries = document.querySelectorAll('.searchEntry');
            expect(searchEntries).toHaveLength(3);
            
            // Check that first 3 results are shown
            expect(searchEntries[0].textContent).toContain('Post 1');
            expect(searchEntries[1].textContent).toContain('Post 2');
            expect(searchEntries[2].textContent).toContain('Post 3');
        });
    });

    it('should handle special characters in search', async () => {
        renderWithRouter(<Header />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'test & search' } });
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('search/test%20%26%20search'),
                expect.any(Object)
            );
        });
    });

    it('should handle component mounting and unmounting', () => {
        const { unmount } = renderWithRouter(<Header />);
        
        expect(screen.getByText('im')).toBeInTheDocument();
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });
});
