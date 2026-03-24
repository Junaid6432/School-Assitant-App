export const generateAbsenceMessage = (studentName: string) => {
  const text = `*محترم والدین!* 📚

آج آپ کا بچہ *${studentName}* سکول سے غیر حاضر ہے- 🚫

براہ کرم بچے کی غیر حاضری کی وجہ بتائیں یا کل سکول بھیجیں- ✅

شکریہ! 
*Government Primary School No.4 Kunda* 🎓`;
  
  return encodeURIComponent(text);
};

export const generateHomeworkMessage = (studentName: string, subject: string, details: string) => {
  const text = `*محترم والدین!* ✍️

آج کا ہوم ورک (گھر کا کام):
کلاس: *3rd* 📖
مضمون: *${subject}* 📝
کام کی تفصیل: ${details} ✨

براہ کرم چیک کریں کہ بچے نے کام مکمل کر لیا ہے- ✅

شکریہ! 🎓`;
  
  return encodeURIComponent(text);
};

export const generateHomeworkPendingMessage = (parentName: string, studentName: string, subject: string) => {
  const text = `السلام علیکم ${parentName} صاحب،\n\nآپ کے بچے/بچی *${studentName}* نے آج *${subject}* کا ہوم ورک مکمل نہیں کیا ہے۔ 🚫\n\nبرائے مہربانی اس پر توجہ دیں اور ہوم ورک مکمل کروائیں۔\n\nشکریہ! 🎓`;
  
  return encodeURIComponent(text);
};
export const generateResultMessage = (parentName: string, studentName: string, total: number, percentage: number, status: string) => {
  const text = `السلام علیکم ${parentName} صاحب،\n\nخوشخبری! آپ کے بچے/بچی *${studentName}* کا سالانہ رزلٹ تیار ہے۔ 🎉\n\n*حاصل کردہ نمبر:* ${total} / 700\n*فیصد:* ${percentage}%\n*نتیجہ:* ${status === 'Pass' ? 'کامیاب ✅' : 'ناکام ❌'}\n\nمزید تفصیلات کے لیے سکول تشریف لائیں۔\n\nشکریہ! 🎓`;
  
  return encodeURIComponent(text);
};
