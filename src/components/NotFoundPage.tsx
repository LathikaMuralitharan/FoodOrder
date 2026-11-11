import { Link } from 'react-router-dom';
import { PageWrapper } from './layout/PageWrapper';

export function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <Link to="/" className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium">
          Go to homepage
        </Link>
      </div>
    </PageWrapper>
  );
}
