export interface AnalysisTemplate {
  _id: string;
  name: string;
  description?: string;
  codes: string[];
  codesUnionCombinations: string[][];
  invitroCode?: string;
  invitroPrice?: number;
  specialPrice?: number;
  price?: number;
  testType: TestType;
  isActive: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialistTemplate {
  _id: string;
  name: string;
  codes: string[];
  codesUnionCombinations: string[][];
  testType: TestType;
  isActive: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticTemplate {
  _id: string;
  name: string;
  description?: string;
  codes: string[];
  codesUnionCombinations: string[][];
  testType: TestType;
  isActive: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationTemplate {
  _id: string;
  name: string;
  content: string;
  testType: TestType;
  isActive: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export type TestType =
  | "female"
  | "male"
  | "sport"
  | "female-pregnancy"
  | "male-pregnancy"
  | "post-pregnant"
  | "intim";

export const TEST_TYPES: { value: TestType; label: string }[] = [
  { value: "female", label: "Female Checkup" },
  { value: "male", label: "Male Checkup" },
  { value: "sport", label: "Sport Checkup" },
  { value: "female-pregnancy", label: "Female Pregnancy Prep" },
  { value: "male-pregnancy", label: "Male Pregnancy Prep" },
  { value: "post-pregnant", label: "Post-Pregnancy" },
  { value: "intim", label: "Intimate Test" },
];

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
