import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../../features/auth/LoginForm';
import { AuthProvider } from '../../features/auth/AuthContext';
import { authService } from '../../features/auth/authService';

vi.mock('../../features/auth/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

  it('renders email and password inputs and login button', () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays validation errors when submitting with empty fields', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('displays API error alert when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Email or password is incorrect.'));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
  });

  it('calls authService.login and succeeds with valid credentials', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'valid.token',
      user: {
        id: 'u1',
        name: 'Jane Doe',
        email: 'test@example.com',
        phone: '1234567890',
        createdAt: new Date().toISOString(),
      },
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
