import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validator } from '../../utils/validator';
import { authService } from './authService';
import { useAuthContext } from './AuthContext';
import type { LoginFormValues, ValidationResult } from '../../types';

export function LoginForm() {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<keyof LoginFormValues, ValidationResult>>({
    email: { isValid: true, error: null },
    password: { isValid: true, error: null },
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: { isValid: true, error: null } }));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = validator.validateLoginForm(values);
    setErrors(validation);

    const hasErrors = Object.values(validation).some(r => !r.isValid);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      const { user, token } = await authService.login(values);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      const redirect = sessionStorage.getItem('redirectAfterLogin') ?? '/';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      {apiError && (
        <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {apiError}
        </div>
      )}
      <Input
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email.error}
        placeholder="jane@example.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password.error}
        placeholder="Your password"
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Login
      </Button>
      <div className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-500">
          Sign up
        </Link>
      </div>
    </form>
  );
}
