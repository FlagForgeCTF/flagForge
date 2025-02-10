import { UserI } from '../types/user';
import { RegisterFormData } from './register';

export type AuthContextType = {
  user: UserI | null;
  loading: boolean;

  authenticated: boolean;
  unauthenticated: boolean;

  login: (data: { email: string; password: string; }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  editProfile: (data: UserI) => Promise<void>;
  register: (register: RegisterFormData) => Promise<void>;
  logout: (req?: boolean) => Promise<void>;
};

export type DropdownContextType = {
  state: boolean;
  open: () => void;
  timedOpen: () => void;
  close: () => void;

  coursesDropdown: boolean;
  handleCourses: (value: boolean) => void;

  tests: boolean;
  handleTests: (value: boolean) => void;
};


export interface ErrorResponseI {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}
