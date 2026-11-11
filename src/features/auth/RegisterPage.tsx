import { PageWrapper } from '../../components/layout/PageWrapper';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  return (
    <PageWrapper>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Create an Account</h1>
      <RegisterForm />
    </PageWrapper>
  );
}
