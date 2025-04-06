
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define roles
export type UserRole = 'worker' | 'management' | 'unauthenticated';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

// Mock user data for our demo
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Worker',
    email: 'worker1@factory.com',
    password: 'password123',
    role: 'worker' as UserRole,
  },
  {
    id: '2',
    name: 'Jane Worker',
    email: 'worker2@factory.com',
    password: 'password123',
    role: 'worker' as UserRole,
  },
  {
    id: '3',
    name: 'Admin Manager',
    email: 'admin@factory.com',
    password: 'admin123',
    role: 'management' as UserRole,
  },
];

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define permission matrix
const PERMISSIONS = {
  worker: ['view_own_tasks', 'add_own_task', 'delete_own_task'],
  management: [
    'view_own_tasks',
    'add_own_task',
    'delete_own_task',
    'view_all_tasks',
    'add_task_to_any',
    'modify_any_task',
    'delete_any_task',
  ],
  unauthenticated: [],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved auth
    const savedUser = localStorage.getItem('factory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call with mock users
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    // Create authenticated user (omitting password)
    const authenticatedUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    };

    // Save to localStorage
    localStorage.setItem('factory_user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('factory_user');
    setUser(null);
  };

  const hasPermission = (action: string) => {
    if (!user) return false;
    return PERMISSIONS[user.role].includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
