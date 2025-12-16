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

// Checkup Template Types
export type QuestionType =
  | "single"
  | "multi"
  | "multiple"
  | "form"
  | "single-with-input"
  | "multiple-with-input";

export interface InputConfig {
  label: string;
  name: string;
  type: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface QuestionVariant {
  label: string;
  value: string;
  hasInput?: boolean;
  inputConfig?: InputConfig;
}

export interface FormField {
  label: string;
  name: string;
  type: "text" | "number" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface QuestionCondition {
  questionId: string;
  values: string[];
}

export interface QuestionDisclaimer {
  title: string;
  text: string;
}

export interface CheckupQuestion {
  index: number;
  id: string;
  question: string;
  type: QuestionType;
  variants?: QuestionVariant[];
  fields?: FormField[];
  condition?: QuestionCondition;
  disclaimer?: QuestionDisclaimer;
  hasOtherAnswer?: boolean;
  hasNoSelectedAnswer?: boolean;
}

export interface Doctor {
  role: string;
  name: string;
  instagram: string;
}

export interface CheckupTemplate {
  _id: string;
  testKey: string;
  title: string;
  carouselTitle: string;
  carouselSubtitle: string;
  description: string;
  image?: string;
  benefits: string[];
  doctors: Doctor[];
  free: boolean;
  price?: number;
  pdfTemplate?: string;
  isActive: boolean;
  questions: CheckupQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckupTemplateDto {
  testKey: string;
  title: string;
  carouselTitle: string;
  carouselSubtitle: string;
  description: string;
  image?: string;
  benefits?: string[];
  doctors?: Doctor[];
  free: boolean;
  price?: number;
  pdfTemplate?: string;
  isActive: boolean;
  questions: CheckupQuestion[];
}

export type UpdateCheckupTemplateDto = Partial<CreateCheckupTemplateDto>;

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
