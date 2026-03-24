"use client";

import { useState, useRef } from "react";
import { FileDown, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { collection, writeBatch, query, where, getDocs, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface BulkImportBtnProps {
  teacherId: string;
  emisCode: string;
  assignedClass: string;
  onImportSuccess: () => void;
}

const generateSampleExcel = (assignedClass: string) => {
  const data = [
    {
      "Name": "Ahmed Ali",
      "Parent Name": "Ali Khan",
      "Roll No": "101",
      "Class": assignedClass,
      "Phone Number": "923000000000"
    },
    {
      "Name": "Sara Bibi",
      "Parent Name": "Zaid Khan",
      "Roll No": "102",
      "Class": assignedClass,
      "Phone Number": "923111111111"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "Student_Import_Template.xlsx");
};

export default function BulkImportBtn({ teacherId, emisCode, assignedClass, onImportSuccess }: BulkImportBtnProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => generateSampleExcel(assignedClass);

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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert("The file is empty!");
          setIsImporting(false);
          return;
        }

        // Validate headers
        const firstRow = jsonData[0] as any;
        const requiredColumns = ['Name', 'Parent Name', 'Roll No', 'Class', 'Phone Number'];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
          alert(`Missing required columns: ${missingColumns.join(", ")}`);
          setIsImporting(false);
          return;
        }

        // Check for duplicates and prepare batch
        const batch = writeBatch(db);
        const studentsRef = collection(db, "students");
        
        // Fetch existing roll numbers for this teacher to avoid duplicates
        const q = query(studentsRef, where("teacherId", "==", teacherId));
        const existingSnap = await getDocs(q);
        const existingRolls = new Set(existingSnap.docs.map(doc => doc.data().rollNumber));

        let importCount = 0;
        let skipCount = 0;

        for (const row of jsonData as any[]) {
          const rollNo = String(row['Roll No']);
          
          if (existingRolls.has(rollNo)) {
            skipCount++;
            continue;
          }

          const newStudentRef = doc(studentsRef);
          batch.set(newStudentRef, {
            name: row['Name'],
            parentName: row['Parent Name'],
            rollNumber: rollNo,
            class: row['Class'] || assignedClass,
            parentWhatsApp: String(row['Phone Number']),
            teacherId: teacherId,
            emisCode: emisCode,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          
          existingRolls.add(rollNo);
          importCount++;

          // Firestore batch limit is 500
          if (importCount % 500 === 0) {
            await batch.commit();
          }
        }

        if (importCount > 0) {
          await batch.commit();
          alert(`Successfully imported ${importCount} students! ${skipCount > 0 ? `(${skipCount} duplicates skipped)` : ""}`);
          onImportSuccess();
        } else {
          alert("No new students were imported. (All entries were duplicates)");
        }
      } catch (err) {
        console.error("Error importing students:", err);
        alert("Failed to parse file. Please ensure it's a valid Excel or CSV file.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={cn(
            "flex items-center gap-2 px-6 h-11 rounded-xl border-2 border-slate-700/50 bg-[#1e293b]/50 text-[#2dd4bf] font-black uppercase tracking-widest text-[10px] hover:bg-[#1e293b] hover:border-[#2dd4bf]/40 transition-all shadow-sm whitespace-nowrap active:scale-95 group",
            isImporting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          {isImporting ? "Processing..." : "Import from Excel"}
        </button>
        
        <button 
          type="button"
          onClick={handleDownloadTemplate}
          className="md:hidden text-[9px] font-black text-slate-500 hover:text-[#2dd4bf] flex items-center gap-2 transition-colors uppercase tracking-[0.2em] whitespace-nowrap italic"
        >
          <FileDown className="w-3 h-3" />
          Sample Template
        </button>
      </div>
    </>
  );
}

// Separate component for the template link to use in the header layout
export function SampleTemplateLink({ assignedClass }: { assignedClass: string }) {
  return (
    <button 
      type="button"
      onClick={() => generateSampleExcel(assignedClass)}
      className="text-[10px] font-black text-slate-500 hover:text-[#2dd4bf] flex items-center gap-2 transition-colors uppercase tracking-[0.25em] whitespace-nowrap italic"
    >
      <FileDown className="w-4 h-4" />
      Get Microsoft Excel Protocol (Sample)
    </button>
  );
}
