/**
 * Central export for all TypeScript types
 * Provides convenient imports across the application
 */

// Assessment types
export * from './assessment';

// UI component types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: React.ReactNode;
  variant?: 'base' | 'interactive' | 'elevated';
  padding?: 'none' | 'small' | 'default' | 'large';
  className?: string;
  onClick?: () => void;
}

// User types
export interface User {
  uid: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAnonymous: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  emailUpdates?: boolean;
  language?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

// API types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error types
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    onRetry: () => void;
    retryCount: number;
  }>;
  level?: 'page' | 'component';
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
  children?: NavItem[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState {
  values: { [key: string]: any };
  errors: { [key: string]: string };
  isSubmitting: boolean;
  isValid: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

// Premium/Payment types
export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'annual';
  features: string[];
  badge?: string;
  savings?: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  category: string;
  featuredImage?: string;
  readTime: number;
  isPublished: boolean;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: { [key: string]: any };
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: { [key: string]: any };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// Component type helpers
export type ComponentWithChildren<P = {}> = React.ComponentType<P & { children: React.ReactNode }>;

export type IconComponent = React.ComponentType<{ className?: string; size?: number; }>;

export type EventHandler<T = any> = (event: T) => void;

export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Hook return types
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UseFormReturn<T = any> {
  values: T;
  errors: { [K in keyof T]?: string };
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T, error: string) => void;
  clearErrors: () => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => void;
  reset: (initialValues?: Partial<T>) => void;
}

export default {};