export type UserRole = 'Teacher' | 'Head Teacher';

export interface Teacher {
  teacherId: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  assignedClass: string;
  emisCode: string;
  role: UserRole;
  createdAt: any;
}

export interface Student {
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  parentName: string;
  parentWhatsApp: string;
  photoURL?: string;
  academicYear: string;
  emisCode: string;
  currentTotalScore: number;
  rank?: number;
}

export interface AttendanceRecord {
  attendanceId: string; // e.g., Class3_2024-03-13
  class: string;
  date: string;
  emisCode: string;
  records: {
    [studentId: string]: 'Present' | 'Absent' | 'Leave';
  };
}

export interface Homework {
  homeworkId: string;
  class: string;
  subject: string;
  date: string;
  emisCode: string;
  details: string;
  imageUrl?: string;
  status: {
    [studentId: string]: 'Done' | 'Not Done';
  };
}

export interface Assessment {
  assessmentId: string;
  studentId: string;
  class: string;
  type: 'Monthly Test' | 'Final Exam';
  term: string; // e.g., "March 2024"
  date: string;
  emisCode: string;
  marks: {
    english?: number;
    math?: number;
    urdu?: number;
    pashto?: number;
    islamiyat?: number;
    socialStudy?: number;
    generalScience?: number;
  };
  total: number;
}

export const SUBJECTS = [
  'English',
  'Math',
  'Urdu',
  'Pashto',
  'Islamiyat',
  'Social Study',
  'General Science'
];

export const CLASSES = ['Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
