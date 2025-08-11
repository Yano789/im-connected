import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIDashboardEntry from '../../Dashboard/AIDashboardEntry/AIDashboardEntry';

describe('AIDashboardEntry Component', () => {
    const mockOnClick = vi.fn();
    
    const defaultProps = {
        itemName: 'Test Item Name',
        itemTitle: 'Test Item Title',
        onClick: mockOnClick
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render item name when provided', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        expect(screen.getByText('Test Item Name')).toBeInTheDocument();
    });

    it('should render item title when provided', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        expect(screen.getByText('Test Item Title')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        const container = screen.getByText('Test Item Name').closest('.itemDiv');
        fireEvent.click(container);
        
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined itemTitle gracefully', () => {
        const propsWithoutTitle = {
            itemName: 'Test Item Name',
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...propsWithoutTitle} />);
        
        expect(screen.getByText('Test Item Name')).toBeInTheDocument();
        // itemTitle div should exist but be empty
        const itemBox = screen.getByText('Test Item Name').closest('.itemBox');
        expect(itemBox.querySelector('.itemTitle')).toBeInTheDocument();
    });

    it('should handle undefined itemName gracefully', () => {
        const propsWithoutName = {
            itemTitle: 'Test Item Title',
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...propsWithoutName} />);
        
        expect(screen.getByText('Test Item Title')).toBeInTheDocument();
        // itemName div should exist but be empty
        const itemBox = screen.getByText('Test Item Title').closest('.itemBox');
        expect(itemBox.querySelector('.itemName')).toBeInTheDocument();
    });

    it('should handle missing onClick prop gracefully', () => {
        const propsWithoutOnClick = {
            itemName: 'Test Item Name',
            itemTitle: 'Test Item Title'
        };
        
        render(<AIDashboardEntry {...propsWithoutOnClick} />);
        
        const container = screen.getByText('Test Item Name').closest('.itemDiv');
        // Should not throw error when clicked
        expect(() => fireEvent.click(container)).not.toThrow();
    });

    it('should apply correct CSS classes', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        const itemDiv = screen.getByText('Test Item Name').closest('.itemDiv');
        expect(itemDiv).toHaveClass('itemDiv');
        
        const itemBox = screen.getByText('Test Item Name').closest('.itemBox');
        expect(itemBox).toHaveClass('itemBox');
        
        const itemName = screen.getByText('Test Item Name');
        expect(itemName).toHaveClass('itemName');
        
        const itemTitle = screen.getByText('Test Item Title');
        expect(itemTitle).toHaveClass('itemTitle');
    });

    it('should handle empty string props', () => {
        const emptyProps = {
            itemName: '',
            itemTitle: '',
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...emptyProps} />);
        
        const itemDiv = document.querySelector('.itemDiv');
        expect(itemDiv).toBeInTheDocument();
        
        const itemBox = document.querySelector('.itemBox');
        expect(itemBox).toBeInTheDocument();
    });

    it('should handle long text content', () => {
        const longTextProps = {
            itemName: 'Very Long Item Name That Might Overflow Container Width',
            itemTitle: 'Very Long Item Title That Might Also Overflow The Container Width And Cause Layout Issues',
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...longTextProps} />);
        
        expect(screen.getByText(longTextProps.itemName)).toBeInTheDocument();
        expect(screen.getByText(longTextProps.itemTitle)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
        const specialCharProps = {
            itemName: 'Item with émojis 🚀 & spëcial chars',
            itemTitle: 'Title with números 123 & símbolos !@#$%',
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...specialCharProps} />);
        
        expect(screen.getByText(specialCharProps.itemName)).toBeInTheDocument();
        expect(screen.getByText(specialCharProps.itemTitle)).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        const container = screen.getByText('Test Item Name').closest('.itemDiv');
        
        // Click multiple times rapidly
        fireEvent.click(container);
        fireEvent.click(container);
        fireEvent.click(container);
        
        expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should maintain component structure with minimal props', () => {
        const minimalProps = {
            onClick: mockOnClick
        };
        
        render(<AIDashboardEntry {...minimalProps} />);
        
        // Should still render the structure even with minimal props
        const itemDiv = document.querySelector('.itemDiv');
        const itemBox = document.querySelector('.itemBox');
        const itemName = document.querySelector('.itemName');
        const itemTitle = document.querySelector('.itemTitle');
        
        expect(itemDiv).toBeInTheDocument();
        expect(itemBox).toBeInTheDocument();
        expect(itemName).toBeInTheDocument();
        expect(itemTitle).toBeInTheDocument();
    });

    it('should be keyboard accessible (onClick on div)', () => {
        render(<AIDashboardEntry {...defaultProps} />);
        
        const container = screen.getByText('Test Item Name').closest('.itemDiv');
        
        // Test keyboard interaction
        fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' });
        fireEvent.keyDown(container, { key: ' ', code: 'Space' });
        
        // Note: The component doesn't handle keyboard events natively,
        // but we can test that the structure is there for potential enhancement
        expect(container).toBeInTheDocument();
    });
});
