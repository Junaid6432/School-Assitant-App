import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
export function getAcademicSession() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  
  if (month <= 6) {
    return `${year - 1} – ${year}`;
  } else {
    return `${year} – ${year + 1}`;
  }
}

export function getShortAcademicSession() {
  const session = getAcademicSession();
  return session.replace("20", "").replace("20", ""); // e.g., 25 – 26
}
