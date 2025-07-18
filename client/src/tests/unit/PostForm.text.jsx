import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PostForm from '../../components/PostForm';

describe('PostForm Component', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<PostForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit post/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit post/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Content is required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/content/i), 'Test Content');
    await user.type(screen.getByLabelText(/category/i), 'Test Category');
    
    await user.click(screen.getByRole('button', { name: /submit post/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        category: 'Test Category'
      });
    });
  });

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={mockOnSubmit} />);
   
    await user.click(screen.getByRole('button', { name: /submit post/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/title/i), 'T');
    
    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  it('populates form with initial data', () => {
    const initialData = {
      title: 'Initial Title',
      content: 'Initial Content',
      category: 'Initial Category'
    };
    
    render(<PostForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Category')).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByLabelText(/title/i)).toBeDisabled();
    expect(screen.getByLabelText(/content/i)).toBeDisabled();
    expect(screen.getByLabelText(/category/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
  });
});