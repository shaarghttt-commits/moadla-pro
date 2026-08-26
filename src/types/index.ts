export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | string;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

export interface SectionType {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  order: number;
  isActive: boolean;
  subjectsCount?: number;
  examsCount?: number;
  subjects?: SubjectType[];
}

export interface SubjectType {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string | null;
  sectionId: string;
  section?: SectionType;
  order: number;
  isActive: boolean;
  units?: UnitType[];
  exams?: ExamType[];
  unitsCount?: number;
  lessonsCount?: number;
  progressPercentage?: number;
}

export interface UnitType {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  subjectId: string;
  lessons?: LessonType[];
}

export interface LessonType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  contentMarkdown?: string | null;
  videoUrl?: string | null;
  durationMinutes: number;
  order: number;
  isFree: boolean;
  unitId: string;
  unit?: UnitType;
  files?: LessonFileType[];
  isCompleted?: boolean;
}

export interface LessonFileType {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  lessonId: string;
}

export interface ChoiceType {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface QuestionType {
  id: string;
  examId: string;
  questionText: string;
  explanation?: string | null;
  marks: number;
  order: number;
  choices: ChoiceType[];
}

export interface ExamType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  subjectId?: string | null;
  subject?: SubjectType | null;
  sectionId?: string | null;
  section?: SectionType | null;
  year?: number | null;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  isPublished: boolean;
  questionsCount?: number;
  questions?: QuestionType[];
  userAttempt?: ExamAttemptType | null;
}

export interface ExamAttemptType {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalPossible: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  completedAt: Date | string;
  exam?: ExamType;
  answers?: {
    id: string;
    questionId: string;
    selectedChoiceId?: string | null;
    isCorrect: boolean;
    question?: QuestionType;
  }[];
}

export interface NotificationType {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

export interface FavoriteItemType {
  id: string;
  userId: string;
  targetType: 'SUBJECT' | 'LESSON' | 'EXAM';
  targetId: string;
  createdAt: Date | string;
  subject?: SubjectType;
  lesson?: LessonType;
  exam?: ExamType;
}

export interface AdminStats {
  totalStudents: number;
  totalSubjects: number;
  totalLessons: number;
  totalExams: number;
  totalAttempts: number;
  averagePassRate: number;
  recentStudents: UserSession[];
  recentAttempts: ExamAttemptType[];
}
