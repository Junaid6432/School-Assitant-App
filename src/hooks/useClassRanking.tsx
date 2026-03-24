"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export interface StudentRanking {
  id: string;
  name: string;
  rollNumber: string;
  attendanceScore: number; // out of 5
  homeworkScore: number;   // out of 10
  quizScore: number;       // out of 10
  testScore: number;       // out of 25
  totalScore: number;      // out of 50
  rank: number;
}

export function useClassRanking() {
  const { teacher, loading: authLoading } = useAuth();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !teacher?.teacherId) return;

    // 1. Listen to all required collections
    const studentsQuery = query(collection(db, "students"), where("emisCode", "==", teacher.emisCode), where("teacherId", "==", teacher.teacherId));
    const attendanceQuery = query(collection(db, "attendance"), where("emisCode", "==", teacher.emisCode), where("teacherId", "==", teacher.teacherId));
    const homeworkQuery = query(collection(db, "homework"), where("emisCode", "==", teacher.emisCode), where("teacherId", "==", teacher.teacherId));
    const assessmentsQuery = query(collection(db, "assessments"), where("emisCode", "==", teacher.emisCode), where("teacherId", "==", teacher.teacherId));

    const unsubStates: any[] = [];
    let students: any[] = [];
    let attendanceDocs: any[] = [];
    let homeworkDocs: any[] = [];
    let assessmentsDocs: any[] = [];

    const calculate = () => {
      if (students.length === 0) {
        setRankings([]);
        setLoading(false);
        return;
      }

      const calculatedRankings: StudentRanking[] = students.map(student => {
        // --- Attendance Calculation (5%) ---
        // (Days Present / Total Days) * 5
        let totalAttendanceDays = 0;
        let presentDays = 0;
        attendanceDocs.forEach(doc => {
          const record = doc.records?.[student.id];
          if (record) {
            totalAttendanceDays++;
            if (record.status === "Present") presentDays++;
          }
        });
        const attendanceScore = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 5 : 0;

        // --- Homework Calculation (10%) ---
        // (Homeworks "Done" / Total Homeworks) * 10
        let totalHomeworks = 0;
        let doneHomeworks = 0;
        homeworkDocs.forEach(doc => {
          const status = doc.studentStatuses?.[student.id];
          if (status) {
            totalHomeworks++;
            if (status === "Done") doneHomeworks++;
          }
        });
        const homeworkScore = totalHomeworks > 0 ? (doneHomeworks / totalHomeworks) * 10 : 0;

        // --- Quizzes and Monthly Tests Calculation ---
        let totalQuizMarks = 0;
        let totalQuizMax = 0;
        let totalTestMarks = 0;
        let totalTestMax = 0;

        assessmentsDocs.forEach(doc => {
          const score = doc.studentScores?.[student.id];
          if (typeof score === 'number') {
            if (doc.type === "Class Quiz") {
              totalQuizMarks += score;
              totalQuizMax += 100;
            } else if (doc.type === "Monthly Test") {
              totalTestMarks += score;
              totalTestMax += 100;
            }
          }
        });

        const quizScore = totalQuizMax > 0 ? (totalQuizMarks / totalQuizMax) * 10 : 0;
        const testScore = totalTestMax > 0 ? (totalTestMarks / totalTestMax) * 25 : 0;

        const totalScore = attendanceScore + homeworkScore + quizScore + testScore;

        return {
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          attendanceScore: Number(attendanceScore.toFixed(2)),
          homeworkScore: Number(homeworkScore.toFixed(2)),
          quizScore: Number(quizScore.toFixed(2)),
          testScore: Number(testScore.toFixed(2)),
          totalScore: Number(totalScore.toFixed(2)),
          rank: 0 // Placeholder
        };
      });

      // Sort and Assign Rank
      calculatedRankings.sort((a, b) => b.totalScore - a.totalScore);
      calculatedRankings.forEach((item, index) => {
        item.rank = index + 1;
      });

      setRankings(calculatedRankings);
      setLoading(false);
    };

    unsubStates.push(onSnapshot(studentsQuery, (snap) => {
      students = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      calculate();
    }));

    unsubStates.push(onSnapshot(attendanceQuery, (snap) => {
      attendanceDocs = snap.docs.map(doc => doc.data());
      calculate();
    }));

    unsubStates.push(onSnapshot(homeworkQuery, (snap) => {
      homeworkDocs = snap.docs.map(doc => doc.data());
      calculate();
    }));

    unsubStates.push(onSnapshot(assessmentsQuery, (snap) => {
      assessmentsDocs = snap.docs.map(doc => doc.data());
      calculate();
    }));

    return () => unsubStates.forEach(unsub => unsub());
  }, [teacher, authLoading]);

  return { rankings, loading };
}
