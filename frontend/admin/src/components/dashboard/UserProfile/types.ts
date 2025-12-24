export type ProfileTab = 
  | 'profile' 
  | 'security' 
  | 'teams' 
  | 'team-member' 
  | 'notifications' 
  | 'billing' 
  | 'data-export' 
  | 'delete-account' 
  | 'password';

export interface TabItem {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}

export interface EditFormData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  bio: string;
  learningGoal: string;
  level: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfileProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}
