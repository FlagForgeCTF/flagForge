import { Types } from "mongoose";
import { HTMLProps, ReactNode } from "react";

export interface NavbarItems {
  href: string;
  tags: string;
  onClick?: () => void;
  style: HTMLProps<HTMLElement>["className"];
}

export interface GoogleProviderConfig {
  clientId: string;
  clientSecret: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface Users {
  email: string;
  image?: string;
  name?: string;
  customBadges?:string;
  questionsDone?: string[];
  totalScore?: number;
  role?: string;
}

export interface Hint {
  _id?: string;
  text: string;
  content:string;
  pointsDeduction: number;
  description:string;
}

export interface Questions {
  title: string;
  description: string;
  category: string;
  points: number;
  flag?: string;
  isSolved?: boolean;
  addilinks?: string;
  done: any;
  _id?: string;
  link?: string;
  challengeFile?: string;
  challengeType?: 'link' | 'file';
  hints?: Hint[];
  isTimeLimited?: boolean;
  timeLimit?: number;
  timeLimitUnit?: 'hours' | 'days' | 'weeks';
  expiryDate?: string | Date | null;
  uploadedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isExpired?: boolean;
  timeRemaining?: number;
  solveCount?: number;
}

export interface UserQuestion {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  scoredPoint: number;
  _id?: string;
  solvedAt?: Date;
  pointsEarned?: number;
  awarded?: number;
  hintsUsed?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HintUsage {
  _id?: string;
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  hintId: string;
  usedAt: Date;
  pointsDeducted: number;
}

export interface ProblemApiResponse {
  question: Questions;
  isDone: boolean;
  expired?: boolean;
  timeRemaining?: number | null;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  pointsEarned?: number;
  totalScore?: number;
}