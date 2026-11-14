import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validator } from '../../utils/validator';
import { authService } from './authService';
import { useAuthContext } from './AuthContext';
import type { RegisterFormValues, ValidationResult } from '../../types';

export function RegisterForm() {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [values, setValues] = useState<RegisterFormValues>({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<keyof RegisterFormValues, ValidationResult>>({
    name: { isValid: true, error: null },
    email: { isValid: true, error: null },
    password: { isValid: true, error: null },
    phone: { isValid: true, error: null },
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: { isValid: true, error: null } }));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = validator.validateRegistrationForm(values);
    setErrors(validation);

    const hasErrors = Object.values(validation).some(r => !r.isValid);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      const { user, token } = await authService.register(values);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setApiError(message);
      setValues(prev => ({ ...prev, password: '' }));
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
        label="Name"
        name="name"
        type="text"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name.error}
        placeholder="Jane Doe"
      />
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
        placeholder="At least 8 characters"
      />
      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone.error}
        placeholder="5551234567"
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Register
      </Button>
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">
          Log in
        </Link>
      </div>
    </form>
  );
}
