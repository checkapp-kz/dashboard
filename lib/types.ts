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

// TestType теперь динамический - любой testKey из CheckupTemplate
export type TestType = string;

// Legacy defaults - используются как fallback при отсутствии данных из API
export const DEFAULT_TEST_TYPES: { value: string; label: string }[] = [
  { value: "female", label: "Женский чекап" },
  { value: "male", label: "Мужской чекап" },
  { value: "sport", label: "Спорт чекап" },
  { value: "female-pregnancy", label: "Планирование (жен)" },
  { value: "male-pregnancy", label: "Планирование (муж)" },
  { value: "post-pregnant", label: "После родов" },
  { value: "intim", label: "Интим тест" },
];

// Для обратной совместимости
export const TEST_TYPES = DEFAULT_TEST_TYPES;

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

// Admin Dashboard Types
export interface UserPurchase {
  testId: string;
  testType: string;
  testTypeLabel: string;
  status: "PAID" | "NOT-PAID";
  createdAt: string;
  invitroPaid: boolean;
  homeVisit: boolean;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  checkappId: string;
  isVerified: boolean;
  birthDate?: string;
  incomingSource?: string;
  totalTests: number;
  paidTests: number;
  purchases: UserPurchase[];
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestTypeStat {
  testType: string;
  testTypeLabel: string;
  total: number;
  paid: number;
  unpaid: number;
  completed: number;
  incomplete: number;
}

export interface InvitroStat {
  totalPaid: number;
  totalUnpaid: number;
  homeVisitsRequested: number;
  homeVisitsPaid: number;
}

export interface OrderStat {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

export interface StatisticsResponse {
  testStats: TestTypeStat[];
  totalTests: {
    total: number;
    paid: number;
    unpaid: number;
    completed: number;
    incomplete: number;
  };
  invitroStats: InvitroStat;
  orderStats: OrderStat;
  totalUsers: number;
}
