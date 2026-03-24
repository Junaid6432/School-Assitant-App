"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Teacher } from "@/types";

interface AuthContextType {
  user: User | null;
  teacher: Teacher | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  teacher: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
        if (teacherDoc.exists()) {
          setTeacher(teacherDoc.data() as Teacher);
        }
      } else {
        setTeacher(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, teacher, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
