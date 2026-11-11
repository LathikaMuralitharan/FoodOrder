import { useAuthContext } from './AuthContext';
import type { AuthState, AuthAction } from './authReducer';

export function useAuth(): AuthState & {
  dispatch: React.Dispatch<AuthAction>;
} {
  return useAuthContext();
}
