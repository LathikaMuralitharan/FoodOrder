import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PickupInfo } from '../../types';
import { useAuthContext } from '../auth/AuthContext';
import { validator } from '../../utils/validator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface PickupContactFormProps {
  initialValues?: PickupInfo;
  onSubmit: (pickupInfo: PickupInfo) => void;
  onBack?: () => void;
}

export function PickupContactForm({
  initialValues,
  onSubmit,
  onBack,
}: PickupContactFormProps) {
  const { user } = useAuthContext();

  const [name] = useState(initialValues?.name || user?.name || '');
  const [phone, setPhone] = useState(initialValues?.phone || user?.phone || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const phoneValidation = validator.validatePhone(phone.trim());
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error);
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">1. Self-Pickup Contact Info</h2>
          <p className="text-sm text-gray-500">
            We will send SMS updates and call this number when your order is ready for pickup.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              label="Pickup Name"
              id="pickup-name"
              name="name"
              value={name}
              readOnly
              className="bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">
              Name is linked to your registered account profile.
            </p>
          </div>

          <div>
            <Input
              label="Contact Phone Number (10 digits)"
              id="pickup-phone"
              name="phone"
              type="tel"
              placeholder="1234567890"
              value={phone}
              error={error}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: 10 numeric digits without dashes or spaces.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          {onBack ? (
            <Button type="button" variant="secondary" onClick={onBack}>
              Back to Cart
            </Button>
          ) : <div />}
          <Button type="submit" variant="primary">
            Continue to Payment
          </Button>
        </div>
      </div>
    </form>
  );
}
