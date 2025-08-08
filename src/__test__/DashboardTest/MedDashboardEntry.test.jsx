import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedDashboardEntry from '../../Dashboard/MedDashboardEntry/MedDashboardEntry';

describe('MedDashboardEntry Component', () => {
    const defaultProps = {
        medicineName: 'Test Medicine',
        medicineDosage: '100mg'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render medicine name when provided', () => {
        render(<MedDashboardEntry {...defaultProps} />);
        
        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
    });

    it('should render medicine dosage when provided', () => {
        render(<MedDashboardEntry {...defaultProps} />);
        
        expect(screen.getByText('100mg')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
        render(<MedDashboardEntry {...defaultProps} />);
        
        const itemsDiv = document.querySelector('.items');
        expect(itemsDiv).toBeInTheDocument();
        
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        expect(medicineName.textContent).toBe('Test Medicine');
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
        expect(medicineDosage.textContent).toBe('100mg');
    });

    it('should handle undefined medicine name', () => {
        const propsWithoutName = {
            medicineDosage: '100mg'
        };
        
        render(<MedDashboardEntry {...propsWithoutName} />);
        
        expect(screen.getByText('100mg')).toBeInTheDocument();
        
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        expect(medicineName.textContent).toBe('');
    });

    it('should handle undefined medicine dosage', () => {
        const propsWithoutDosage = {
            medicineName: 'Test Medicine'
        };
        
        render(<MedDashboardEntry {...propsWithoutDosage} />);
        
        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
        expect(medicineDosage.textContent).toBe('');
    });

    it('should handle both properties as undefined', () => {
        render(<MedDashboardEntry />);
        
        const itemsDiv = document.querySelector('.items');
        expect(itemsDiv).toBeInTheDocument();
        
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        expect(medicineName.textContent).toBe('');
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
        expect(medicineDosage.textContent).toBe('');
    });

    it('should handle empty string values', () => {
        const emptyProps = {
            medicineName: '',
            medicineDosage: ''
        };
        
        render(<MedDashboardEntry {...emptyProps} />);
        
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        expect(medicineName.textContent).toBe('');
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
        expect(medicineDosage.textContent).toBe('');
    });

    it('should handle long medicine names', () => {
        const longNameProps = {
            medicineName: 'Very Long Medicine Name That Might Overflow Container Width',
            medicineDosage: '100mg'
        };
        
        render(<MedDashboardEntry {...longNameProps} />);
        
        expect(screen.getByText(longNameProps.medicineName)).toBeInTheDocument();
        expect(screen.getByText('100mg')).toBeInTheDocument();
    });

    it('should handle complex dosage strings', () => {
        const complexDosageProps = {
            medicineName: 'Test Medicine',
            medicineDosage: '100mg twice daily with food'
        };
        
        render(<MedDashboardEntry {...complexDosageProps} />);
        
        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
        expect(screen.getByText('100mg twice daily with food')).toBeInTheDocument();
    });

    it('should handle special characters in medicine name', () => {
        const specialCharProps = {
            medicineName: 'Médicament spëcial & 123',
            medicineDosage: '100mg'
        };
        
        render(<MedDashboardEntry {...specialCharProps} />);
        
        expect(screen.getByText('Médicament spëcial & 123')).toBeInTheDocument();
        expect(screen.getByText('100mg')).toBeInTheDocument();
    });

    it('should handle special characters in dosage', () => {
        const specialCharProps = {
            medicineName: 'Test Medicine',
            medicineDosage: '100mg/día (2x) + vitamins'
        };
        
        render(<MedDashboardEntry {...specialCharProps} />);
        
        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
        expect(screen.getByText('100mg/día (2x) + vitamins')).toBeInTheDocument();
    });

    it('should handle numeric values as props', () => {
        const numericProps = {
            medicineName: 123,
            medicineDosage: 456
        };
        
        render(<MedDashboardEntry {...numericProps} />);
        
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('456')).toBeInTheDocument();
    });

    it('should handle boolean values as props', () => {
        const booleanProps = {
            medicineName: true,
            medicineDosage: false
        };
        
        render(<MedDashboardEntry {...booleanProps} />);
        
        // Boolean values will be rendered as empty in divs
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
    });

    it('should maintain component structure with all variations', () => {
        const { rerender } = render(<MedDashboardEntry {...defaultProps} />);
        
        // Check initial structure
        expect(document.querySelector('.items')).toBeInTheDocument();
        expect(document.querySelector('.medicineName')).toBeInTheDocument();
        expect(document.querySelector('.medicineDosage')).toBeInTheDocument();
        
        // Re-render with different props
        rerender(<MedDashboardEntry medicineName="New Medicine" medicineDosage="200mg" />);
        
        // Structure should remain the same
        expect(document.querySelector('.items')).toBeInTheDocument();
        expect(document.querySelector('.medicineName')).toBeInTheDocument();
        expect(document.querySelector('.medicineDosage')).toBeInTheDocument();
        
        // Content should update
        expect(screen.getByText('New Medicine')).toBeInTheDocument();
        expect(screen.getByText('200mg')).toBeInTheDocument();
    });

    it('should handle HTML entities in props', () => {
        const htmlEntityProps = {
            medicineName: 'Medicine &amp; Co.',
            medicineDosage: '&lt;100mg&gt;'
        };
        
        render(<MedDashboardEntry {...htmlEntityProps} />);
        
        expect(screen.getByText('Medicine &amp; Co.')).toBeInTheDocument();
        expect(screen.getByText('&lt;100mg&gt;')).toBeInTheDocument();
    });

    it('should handle null values as props', () => {
        const nullProps = {
            medicineName: null,
            medicineDosage: null
        };
        
        render(<MedDashboardEntry {...nullProps} />);
        
        const medicineName = document.querySelector('.medicineName');
        expect(medicineName).toBeInTheDocument();
        
        const medicineDosage = document.querySelector('.medicineDosage');
        expect(medicineDosage).toBeInTheDocument();
    });

    it('should handle component mounting and unmounting', () => {
        const { unmount } = render(<MedDashboardEntry {...defaultProps} />);
        
        expect(screen.getByText('Test Medicine')).toBeInTheDocument();
        expect(screen.getByText('100mg')).toBeInTheDocument();
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple instances with different props', () => {
        const { container } = render(
            <div>
                <MedDashboardEntry medicineName="Medicine A" medicineDosage="100mg" />
                <MedDashboardEntry medicineName="Medicine B" medicineDosage="200mg" />
                <MedDashboardEntry medicineName="Medicine C" medicineDosage="300mg" />
            </div>
        );
        
        expect(screen.getByText('Medicine A')).toBeInTheDocument();
        expect(screen.getByText('100mg')).toBeInTheDocument();
        expect(screen.getByText('Medicine B')).toBeInTheDocument();
        expect(screen.getByText('200mg')).toBeInTheDocument();
        expect(screen.getByText('Medicine C')).toBeInTheDocument();
        expect(screen.getByText('300mg')).toBeInTheDocument();
        
        // Should have 3 .items containers
        expect(container.querySelectorAll('.items')).toHaveLength(3);
    });
});
