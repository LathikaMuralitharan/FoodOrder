import { PageWrapper } from '../../components/layout/PageWrapper';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <PageWrapper>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Welcome Back</h1>
      <LoginForm />
    </PageWrapper>
  );
}
