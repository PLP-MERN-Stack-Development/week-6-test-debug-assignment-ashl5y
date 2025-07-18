import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import PostForm from '../../components/PostForm';

jest.mock('axios');
const mockedAxios = axios;

const PostFormContainer = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockedAxios.post('/api/posts', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PostForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">Post created successfully!</div>}
    </div>
  );
};

describe('PostForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully submits form and shows success message', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 1, title: 'Test Post', content: 'Test Content' }
    });

    render(<PostFormContainer />);

    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'Test Content');
    await user.type(screen.getByLabelText(/category/i), 'Technology');

    await user.click(screen.getByRole('button', { name: /submit post/i }));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/posts', {
      title: 'Test Post',
      content: 'Test Content',
      category: 'Technology'
    });
  });

  it('handles API error and shows error message', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } }
    });

    render(<PostFormContainer />);

    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'Test Content');
    await user.type(screen.getByLabelText(/category/i), 'Technology');

    await user.click(screen.getByRole('button', { name: /submit post/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Server error');
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockedAxios.post.mockReturnValueOnce(promise);

    render(<PostFormContainer />);

    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'Test Content');
    await user.type(screen.getByLabelText(/category/i), 'Technology');

    await user.click(screen.getByRole('button', { name: /submit post/i }));

    expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeDisabled();

    resolvePromise({ data: { id: 1 } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit post/i })).toBeInTheDocument();
    });
  });
});