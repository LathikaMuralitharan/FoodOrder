import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { authReducer, initialAuthState, type AuthState, type AuthAction } from './authReducer';
import { storageUtils } from '../../utils/storageUtils';
import { jwtUtils } from '../../utils/jwtUtils';

interface AuthContextValue extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function initAuthState(): AuthState {
  const token = storageUtils.loadToken();
  if (token && jwtUtils.isTokenValid(token)) {
    const user = jwtUtils.decodeUser(token);
    if (user) {
      return {
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
  }
  if (token) storageUtils.clearToken();
  return initialAuthState;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, initAuthState);

  useEffect(() => {
    if (state.token) {
      storageUtils.saveToken(state.token);
    }
  }, [state.token]);

  useEffect(() => {
    if (!state.isAuthenticated && !state.token) {
      storageUtils.clearToken();
    }
  }, [state.isAuthenticated, state.token]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
