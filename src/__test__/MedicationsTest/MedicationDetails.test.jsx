import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationDetails from '../../Medications/MedicationDetails/MedicationDetails';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}));

const mockMedication = {
    id: 'med1',
    name: 'Metformin XR 500mg',
    dosages: [
        { period: 'Morning', time: '10:00', taken: true },
        { period: 'Evening', time: '18:00', taken: true }
    ],
    usedTo: 'Manages Type 2 Diabetes Mellitus.',
    sideEffects: 'May cause Drowsiness',
    image: 'test_image_url.jpg'
};

describe('MedicationDetails Component', () => {

  it('should render a placeholder when no medication is provided', () => {
    const { container } = render(<MedicationDetails medication={null} onEdit={() => {}} />);
    
    const placeholder = container.querySelector('.placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.textContent).toBe('Select a medication to see its details.');
  });

  it('should display all details of the provided medication', () => {
    render(<MedicationDetails medication={mockMedication} onEdit={() => {}} />);

    expect(screen.getByText('Metformin XR 500mg')).toBeInTheDocument();
    expect(screen.getByText('Manages Type 2 Diabetes Mellitus.')).toBeInTheDocument();
    expect(screen.getByText('May cause Drowsiness')).toBeInTheDocument();

    const image = screen.getByRole('img', { name: /Metformin/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test_image_url.jpg');
  });

  it('should apply the "active" class to the correct schedule icons', () => {
    const { container } = render(<MedicationDetails medication={mockMedication} onEdit={() => {}} />);

    const morningIcon = screen.getByText('Morning').closest('.icon-item');
    const afternoonIcon = screen.getByText('Afternoon').closest('.icon-item');
    const eveningIcon = screen.getByText('Evening').closest('.icon-item');
    const nightIcon = screen.getByText('Night').closest('.icon-item');

    expect(morningIcon.classList.contains('active')).toBe(true);
    expect(eveningIcon.classList.contains('active')).toBe(true);
    
    expect(afternoonIcon.classList.contains('active')).toBe(false);
    expect(nightIcon.classList.contains('active')).toBe(false);
  });

  it('should call the onEdit function when the "Edit medicine" button is clicked', () => {
    const handleEdit = vi.fn();

    render(<MedicationDetails medication={mockMedication} onEdit={handleEdit} />);
    
    const editButton = screen.getByRole('button', { name: /Edit medicine/i });
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
});