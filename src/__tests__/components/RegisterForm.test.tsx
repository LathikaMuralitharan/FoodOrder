import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/AuthContext';
import { RegisterForm } from '../../features/auth/RegisterForm';

describe('RegisterForm Component', () => {
  function renderForm() {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </BrowserRouter>
    );
  }

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('renders register button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
});
