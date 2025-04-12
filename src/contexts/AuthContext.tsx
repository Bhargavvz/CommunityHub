import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Define API base URL
const API_URL = '/api';

// For debugging - log all API requests and responses
axios.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'resident';
  flatNumber?: string;
  blockNumber?: string;
  photoURL?: string;
}

type AuthContextType = {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Function to fetch backend user data
  const fetchBackendUserData = async (user: FirebaseUser) => {
    setTokenLoading(true);
    try {
      const idToken = await user.getIdToken(true);
      localStorage.setItem('authToken', idToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
      console.log('Auth token refreshed and set.');

      // Set current user from Firebase user initially
      setCurrentUser({
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        photoURL: user.photoURL || undefined,
        phoneNumber: user.phoneNumber || undefined,
        role: 'resident' // Default role
      });

      // Try to get additional user data from backend
      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        if (response.data && response.data.success) {
          const userData = response.data.data;
          console.log('Backend user data fetched:', userData);
          setCurrentUser(prev => ({
            ...prev!,
            role: userData.role || 'resident',
            ...userData
          }));
        } else {
          console.warn('Backend /auth/me call did not succeed:', response.data);
        }
      } catch (error) {
        console.error("Failed to get user data from backend /auth/me:", error);
        // Keep the user logged in with Firebase data, but log the error
      }
    } catch (error) {
      console.error("Error refreshing ID token:", error);
      // Handle token refresh error (e.g., log out user)
      await logout(); 
    } finally {
      setTokenLoading(false);
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // User is signed in - fetch backend data
        await fetchBackendUserData(user);
      } else {
        // User is signed out
        setCurrentUser(null);
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Login function with email and password
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will trigger fetchBackendUserData
      console.log("Firebase sign-in successful, waiting for state change...");
    } catch (error: any) {
      console.error('Firebase login failed:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      throw new Error(error.message || 'Failed to login');
    }
  };
  
  // Login with Google
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
       // onAuthStateChanged will trigger fetchBackendUserData
      console.log("Google sign-in successful, waiting for state change...");
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      throw new Error(error.message || 'Google sign-in failed');
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });
      console.log('Firebase user created & profile updated, waiting for state change...');
      // onAuthStateChanged will trigger fetchBackendUserData

    } catch (error: any) {
      console.error('Firebase registration failed:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new Error('An account with this email already exists.');
      }
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle cleanup
      console.log('User signed out.');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Password reset request
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Also notify backend
      try {
        await axios.post(`${API_URL}/auth/forgot-password`, { email });
      } catch (error) {
        console.error("Backend password reset notification failed:", error);
        // Continue anyway since Firebase is handling it
      }
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      console.error('Password reset confirmation failed:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!firebaseUser) {
        throw new Error('No user is logged in');
      }
      
      // Update Firebase Auth profile
      const updateData: any = {};
      if (data.name) updateData.displayName = data.name;
      if (data.photoURL) updateData.photoURL = data.photoURL;
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(firebaseUser, updateData);
      }
      
      // Update backend profile
      await axios.put(`${API_URL}/auth/me`, {
        displayName: data.name,
        phoneNumber: data.phoneNumber
      });
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Change password
  const changePassword = async (newPassword: string) => {
    try {
      if (!firebaseUser) {
        throw new Error('No user is logged in');
      }
      
      // This would be handled by reauthenticateWithCredential and updatePassword in a real app
      // For simplicity, we'll just notify the backend
      await axios.post(`${API_URL}/auth/change-password`, { newPassword });
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const value = {
    currentUser,
    firebaseUser,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    confirmPasswordReset,
    updateProfile: updateUserProfile,
    changePassword,
    loading: loading || tokenLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 