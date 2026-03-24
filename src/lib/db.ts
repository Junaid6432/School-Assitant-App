import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { Student, AttendanceRecord, Homework, Assessment } from "@/types";

// Student Operations
export const getStudentsByClass = async (className: string) => {
  const q = query(
    collection(db, "students"), 
    where("class", "==", className),
    orderBy("rollNumber", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() } as any as Student));
};

// Attendance Operations
export const saveAttendance = async (attendanceData: AttendanceRecord) => {
  const docRef = doc(db, "attendance", attendanceData.attendanceId);
  await setDoc(docRef, attendanceData);
};

// Homework Operations
export const assignHomework = async (homeworkData: Omit<Homework, 'homeworkId'>) => {
  return await addDoc(collection(db, "homework"), homeworkData);
};

// Assessment Operations
export const getWeakStudents = async (className: string) => {
  const q = query(
    collection(db, "students"),
    where("class", "==", className),
    where("currentTotalScore", "<", 40)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() } as any as Student));
};

export const getTopStudents = async (className: string, limitCount = 5) => {
  const q = query(
    collection(db, "students"),
    where("class", "==", className),
    orderBy("currentTotalScore", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() } as any as Student));
};

export const saveAssessment = async (assessmentData: Assessment) => {
  const docRef = doc(db, "assessments", assessmentData.assessmentId);
  await setDoc(docRef, assessmentData);

  // Update student's currentTotalScore (simplified logic for now)
  const studentRef = doc(db, "students", assessmentData.studentId);
  await updateDoc(studentRef, {
    currentTotalScore: assessmentData.total
  });
};
