"use client";

import { useState, useRef } from "react";
import { FileSpreadsheet, Download, Loader2, Upload, Plus, Printer, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { collection, writeBatch, query, where, getDocs, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types";

interface BulkMarksActionsProps {
  teacherId: string;
  assignedClass: string;
  students: any[];
  onImportSuccess: () => void;
  onManualEntry: () => void;
  onViewAll: () => void;
}

export default function BulkMarksActions({ 
  teacherId, 
  assignedClass, 
  students,
  onImportSuccess, 
  onManualEntry,
  onViewAll 
}: BulkMarksActionsProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Exact columns as requested
    const headers = [
      "Roll No", "Name", "English", "Math", "Urdu", "Pashto", "Islamiyat", "Social Study", "Gen Science"
    ];

    // Pre-fill with existing students for convenience
    const data = students.map(s => ({
      "Roll No": s.rollNumber,
      "Name": s.name,
      "English": 0,
      "Math": 0,
      "Urdu": 0,
      "Pashto": 0,
      "Islamiyat": 0,
      "Social Study": 0,
      "Gen Science": 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Final Marks");
    XLSX.writeFile(workbook, `Final_Marks_Template_${assignedClass.replace(" ", "_")}.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          alert("The file is empty!");
          setIsImporting(false);
          return;
        }

        const batch = writeBatch(db);
        const examsRef = collection(db, "finalExams");
        
        // Create a map of roll numbers to student IDs for quick lookup
        const rollToIdMap: Record<string, string> = {};
        students.forEach(s => {
          rollToIdMap[String(s.rollNumber)] = s.id;
        });

        let importCount = 0;

        for (const row of jsonData) {
          const rollNo = String(row["Roll No"]);
          const studentId = rollToIdMap[rollNo];

          if (!studentId) continue;

          // Map Excel columns to system subjects
          const marks: Record<string, number> = {
            "English": Number(row["English"]) || 0,
            "Math": Number(row["Math"]) || 0,
            "Urdu": Number(row["Urdu"]) || 0,
            "Pashto": Number(row["Pashto"]) || 0,
            "Islamiyat": Number(row["Islamiyat"]) || 0,
            "Social Study": Number(row["Social Study"]) || 0,
            "General Science": Number(row["Gen Science"]) || 0
          };

          const totalObtained = Object.values(marks).reduce((a, b) => a + b, 0);
          const percentage = parseFloat(((totalObtained / 700) * 100).toFixed(1));

          const resultDocId = `${teacherId}_${studentId}`;
          const resultRef = doc(examsRef, resultDocId);

          batch.set(resultRef, {
            teacherId,
            studentId,
            marks,
            totalObtained,
            percentage,
            updatedAt: Timestamp.now()
          }, { merge: true });

          importCount++;
          if (importCount % 500 === 0) await batch.commit();
        }

        if (importCount > 0) {
          await batch.commit();
          alert(`Successfully imported marks for ${importCount} students! ✅`);
          onImportSuccess();
        } else {
          alert("No matching students found in the file. Please check Roll Numbers.");
        }
      } catch (err) {
        console.error("Error importing marks:", err);
        alert("Failed to parse file. Ensure it matches the template format.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-row flex-wrap items-start justify-end gap-3 w-full md:w-auto">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Button 1: Import Marks + Text Link */}
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center justify-center gap-2 px-6 h-11 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95 shadow-sm min-w-[150px]"
        >
          {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
          <span className="whitespace-nowrap">Import Marks</span>
        </button>
        
        <button 
          onClick={downloadTemplate}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase ml-1 tracking-widest"
        >
          📄 SAMPLE TEMPLATE
        </button>
      </div>

      {/* Button 2: Enter Marks */}
      <button
        onClick={onManualEntry}
        className="btn-primary flex items-center justify-center gap-2 h-11 px-6 shadow-md text-sm font-bold active:scale-95 transition-all min-w-[140px]"
      >
        <Plus className="w-5 h-5" />
        <span className="whitespace-nowrap">Enter Marks</span>
      </button>

      {/* Button 3: View All DMCs */}
      <button
        onClick={onViewAll}
        className="flex items-center justify-center gap-2 px-6 h-11 bg-slate-900 border border-slate-800 shadow-md text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 min-w-[150px]"
      >
        <Eye className="w-5 h-5" />
        <span className="whitespace-nowrap">View All DMCs</span>
      </button>
    </div>
  );
}
