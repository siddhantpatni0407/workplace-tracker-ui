// Enhanced Authentication Usage Guide

## 🔐 Enhanced Authentication System

The authentication system has been significantly improved with better token management, automatic refresh, and comprehensive error handling.

### Key Features:
✅ **Automatic Token Management**: Tokens are automatically attached to all API requests
✅ **Smart Token Refresh**: Automatic token refresh before expiry
✅ **Enhanced Error Handling**: User-friendly error messages for all auth scenarios
✅ **Role-Based Access**: Easy role and permission checking
✅ **Token Monitoring**: Real-time token expiry monitoring
✅ **Secure Storage**: Enhanced token storage with metadata
✅ **Network Error Handling**: Proper handling of service unavailability

### 🚀 Usage Examples:

#### 1. Using Enhanced Auth Context
```typescript
import { useAuth } from '../context/AuthContext';

const MyComponent: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    hasRole, 
    hasAnyRole,
    tokenExpiry,
    checkTokenExpiry
  } = useAuth();

  // Check if user is admin
  const isAdmin = hasRole('ADMIN');
  
  // Check if user has any management role
  const isManager = hasAnyRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
  
  // Get token expiry time
  const expiresInSeconds = tokenExpiry;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p>Role: {user?.role}</p>
          {isAdmin && <AdminPanel />}
          {isManager && <ManagerTools />}
          <p>Token expires in: {expiresInSeconds} seconds</p>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};
```

#### 2. Using Enhanced API Service
```typescript
import { ApiService } from '../services/apiService';

const UserService = {
  // GET request with automatic authentication
  async getUsers() {
    const response = await ApiService.get('/users');
    return response.data;
  },
  
  // POST request with custom error handling
  async createUser(userData: any) {
    const response = await ApiService.post('/users', userData, {
      showErrorToast: true,
      retryOnFailure: true
    });
    return response.data;
  },
  
  // File upload with progress
  async uploadAvatar(file: File, userId: number) {
    const response = await ApiService.uploadFile(
      `/users/${userId}/avatar`,
      file,
      { userId }
    );
    return response.data;
  },
  
  // Public endpoint (no auth required)
  async getPublicData() {
    const response = await ApiService.get('/public/data', {}, {
      requireAuth: false
    });
    return response.data;
  }
};
```

#### 3. Token Management
```typescript
import { TokenService } from '../services/tokenService';

// Check token status
const tokenStatus = {
  hasToken: TokenService.hasAccessToken(),
  isExpired: TokenService.isTokenExpired(),
  needsRefresh: TokenService.needsRefresh(),
  expiryTime: TokenService.getTokenExpiryTime(),
  userId: TokenService.getUserIdFromToken()
};

// Get authorization header
const authHeader = TokenService.getAuthorizationHeader();
// Returns: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Get token metadata
const metadata = TokenService.getTokenMetadata();
// Returns: { userId: 123, email: "user@example.com", role: "USER", exp: Date }
```

#### 4. Error Handling in Components
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ApiService } from '../services/apiService';

const DataComponent: React.FC = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { handleError } = useErrorHandler({
    onAuthError: () => {
      // Redirect to login
      window.location.href = '/login';
    },
    onNetworkError: () => {
      // Show offline message
      console.log('Network error detected');
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get('/api/data');
      setData(response.data);
    } catch (error) {
      handleError(error); // Automatically shows appropriate error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : data ? (
        <div>Data: {JSON.stringify(data)}</div>
      ) : (
        <button onClick={fetchData}>Retry</button>
      )}
    </div>
  );
};
```

#### 5. Login Component Example
```typescript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showErrorToast, showSuccessToast } from '../components/common/errorNotification/ErrorNotification';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.status === 'SUCCESS') {
        showSuccessToast(`Welcome back, ${response.name}!`);
        // Navigation will be handled automatically by auth context
      } else {
        showErrorToast(new Error(response.message || 'Login failed'));
      }
    } catch (error) {
      // Error is automatically handled by the auth system
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

#### 6. Protected Route Component
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles 
}) => {
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage
<ProtectedRoute requiredRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRoles={["ADMIN", "MANAGER"]}>
  <ManagementPanel />
</ProtectedRoute>
```

### 🔧 Automatic Features:

1. **Token Refresh**: Automatically refreshes tokens before expiry
2. **Error Messages**: Shows user-friendly error messages instead of "Network Error"
3. **Retry Logic**: Automatically retries failed requests when appropriate
4. **Auth Headers**: Automatically adds authentication headers to all API requests
5. **Session Monitoring**: Monitors token expiry and logs out expired sessions
6. **Network Detection**: Detects offline/online status and adjusts error messages

### 🎯 Benefits:

- **Better UX**: Users see clear, actionable error messages
- **Automatic Auth**: No need to manually handle tokens in components
- **Smart Retry**: Only retries when it makes sense
- **Role Management**: Easy role-based access control
- **Security**: Enhanced token management and automatic cleanup
- **Monitoring**: Real-time session monitoring and alerts

This enhanced system ensures robust authentication with excellent user experience!