import { useState } from 'react';
import type { FormEvent } from 'react';
import type { MockPaymentInfo } from '../../types';
import { validator } from '../../utils/validator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface PaymentFormProps {
  initialValues?: MockPaymentInfo;
  onSubmit: (paymentInfo: MockPaymentInfo) => void;
  onBack: () => void;
}

export function PaymentForm({
  initialValues,
  onSubmit,
  onBack,
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState(initialValues?.cardNumber || '');
  const [expiry, setExpiry] = useState(initialValues?.expiry || '');
  const [cvv, setCvv] = useState(initialValues?.cvv || '');

  const [errors, setErrors] = useState<{
    cardNumber?: string | null;
    expiry?: string | null;
    cvv?: string | null;
  }>({});

  const handleFillDemo = () => {
    setCardNumber('4111222233334444');
    setExpiry('12/28');
    setCvv('123');
    setErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const cleanedCard = cardNumber.replace(/\s/g, '');
    const cardValidation = validator.validateCardNumber(cleanedCard);
    const expiryValidation = validator.validateExpiry(expiry.trim());
    const cvvValidation = validator.validateCvv(cvv.trim());

    if (!cardValidation.isValid || !expiryValidation.isValid || !cvvValidation.isValid) {
      setErrors({
        cardNumber: cardValidation.error,
        expiry: expiryValidation.error,
        cvv: cvvValidation.error,
      });
      return;
    }

    setErrors({});
    onSubmit({
      cardNumber: cleanedCard,
      expiry: expiry.trim(),
      cvv: cvv.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">2. Simulated Payment</h2>
          <p className="text-sm text-gray-500">
            All transactions are simulated. No actual credit card will be charged.
          </p>
        </div>

        {/* Demo card helper */}
        <div className="mb-5 flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 p-3">
          <div className="text-xs text-indigo-900">
            <span className="font-semibold">Test Card:</span> 4111 •••• •••• 4444 &nbsp;|&nbsp; Exp: 12/28 &nbsp;|&nbsp; CVV: 123
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            aria-label="Auto-fill test card details into the payment form"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            Auto-fill Test Card
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              label="Card Number (13–19 digits)"
              id="payment-card-number"
              name="cardNumber"
              placeholder="4111222233334444"
              value={cardNumber}
              error={errors.cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value);
                if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: null }));
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Expiration (MM/YY)"
                id="payment-expiry"
                name="expiry"
                placeholder="12/28"
                maxLength={5}
                value={expiry}
                error={errors.expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                  if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: null }));
                }}
                required
              />
            </div>
            <div>
              <Input
                label="CVV (3 or 4 digits)"
                id="payment-cvv"
                name="cvv"
                placeholder="123"
                maxLength={4}
                value={cvv}
                error={errors.cvv}
                onChange={(e) => {
                  setCvv(e.target.value);
                  if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: null }));
                }}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back to Contact Info
          </Button>
          <Button type="submit" variant="primary">
            Review Order
          </Button>
        </div>
      </div>
    </form>
  );
}
