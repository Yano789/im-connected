import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PreferencesCard from '../../Profile/PreferencesCard/PreferencesCard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'Preferred Language': 'Preferred Language',
                'Text Size': 'Text Size',
                'Content Mode': 'Content Mode',
                'Small': 'Small',
                'Medium': 'Medium',
                'Large': 'Large',
                'Easy Reader Mode': 'Easy Reader Mode',
                'Default Mode': 'Default Mode'
            };
            return translations[key] || key;
        },
    }),
}));

// Test Data
const mockPreferences = {
    preferredLanguage: 'en',
    textSize: 'Medium',
    contentMode: 'Default Mode'
};

const defaultProps = {
    preferences: mockPreferences,
    onPreferenceChange: vi.fn(),
};

describe('PreferencesCard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all preference sections', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        expect(screen.getByText('Preferred Language')).toBeInTheDocument();
        expect(screen.getByText('Text Size')).toBeInTheDocument();
        expect(screen.getByText('Content Mode')).toBeInTheDocument();
    });

    it('should render all language options', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('中文')).toBeInTheDocument();
        expect(screen.getByText('Bahasa Melayu')).toBeInTheDocument();
        expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    });

    it('should render all text size options', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        expect(screen.getByText('Small')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('should render all content mode options', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        expect(screen.getByText('Easy Reader Mode')).toBeInTheDocument();
        expect(screen.getByText('Default Mode')).toBeInTheDocument();
    });

    it('should highlight selected language preference', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const englishButton = screen.getByText('English');
        expect(englishButton).toHaveClass('selected');
    });

    it('should highlight selected text size preference', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const mediumButton = screen.getByText('Medium');
        expect(mediumButton).toHaveClass('selected');
    });

    it('should highlight selected content mode preference', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const defaultModeButton = screen.getByText('Default Mode');
        expect(defaultModeButton).toHaveClass('selected');
    });

    it('should call onPreferenceChange when language is changed', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const chineseButton = screen.getByText('中文');
        fireEvent.click(chineseButton);
        
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('preferredLanguage', 'zh');
    });

    it('should call onPreferenceChange when text size is changed', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const largeButton = screen.getByText('Large');
        fireEvent.click(largeButton);
        
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('textSize', 'Large');
    });

    it('should call onPreferenceChange when content mode is changed', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const easyReaderButton = screen.getByText('Easy Reader Mode');
        fireEvent.click(easyReaderButton);
        
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('contentMode', 'Easy Reader Mode');
    });

    it('should handle empty preferences gracefully', () => {
        render(<PreferencesCard preferences={{}} onPreferenceChange={vi.fn()} />);
        
        expect(screen.getByText('Preferred Language')).toBeInTheDocument();
        expect(screen.getByText('Text Size')).toBeInTheDocument();
        expect(screen.getByText('Content Mode')).toBeInTheDocument();
        
        // No buttons should be selected when preferences are empty
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).not.toHaveClass('selected');
        });
    });

    it('should handle undefined preferences prop', () => {
        render(<PreferencesCard onPreferenceChange={vi.fn()} />);
        
        expect(screen.getByText('Preferred Language')).toBeInTheDocument();
        expect(screen.getByText('Text Size')).toBeInTheDocument();
        expect(screen.getByText('Content Mode')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const card = screen.getByText('Preferred Language').closest('.preferences-card');
        expect(card).toBeInTheDocument();
        
        const preferenceGroups = screen.getAllByText(/Preferred Language|Text Size|Content Mode/);
        preferenceGroups.forEach(group => {
            expect(group.closest('.preference-group')).toBeInTheDocument();
        });
    });

    it('should handle multiple language selection clicks', () => {
        render(<PreferencesCard {...defaultProps} />);
        
        const malayButton = screen.getByText('Bahasa Melayu');
        const tamilButton = screen.getByText('தமிழ்');
        
        fireEvent.click(malayButton);
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('preferredLanguage', 'ms');
        
        fireEvent.click(tamilButton);
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('preferredLanguage', 'ta');
        
        expect(defaultProps.onPreferenceChange).toHaveBeenCalledTimes(2);
    });

    it('should handle different initial preference values', () => {
        const customPreferences = {
            preferredLanguage: 'zh',
            textSize: 'Large',
            contentMode: 'Easy Reader Mode'
        };
        
        render(<PreferencesCard preferences={customPreferences} onPreferenceChange={vi.fn()} />);
        
        expect(screen.getByText('中文')).toHaveClass('selected');
        expect(screen.getByText('Large')).toHaveClass('selected');
        expect(screen.getByText('Easy Reader Mode')).toHaveClass('selected');
    });
});
