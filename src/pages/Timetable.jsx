// src/pages/Timetable.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import "./Timetable.css"; // CSS file

// 🔹 Convert HH:MM to minutes
function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// 🔹 Build sorted schedule combining periods & breaks
function buildSchedule(periodTimingsObj, breakTimingsObj) {
  const all = [];

  Object.keys(periodTimingsObj || {}).forEach((k) => {
    all.push({
      type: "period",
      index: k,
      start: periodTimingsObj[k].start,
      end: periodTimingsObj[k].end,
    });
  });

  (breakTimingsObj || []).forEach((breakItem, idx) => {
    all.push({
      type: "break",
      index: `B${idx + 1}`,
      start: breakItem.start,
      end: breakItem.end,
    });
  });

  all.sort((a, b) => (timeToMinutes(a.start) || 0) - (timeToMinutes(b.start) || 0));
  return all;
}

// 🔹 Format HH:MM -> 12-hour display
function formatTo12Hour(time) {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function Timetable() {
  const location = useLocation();
  const { timetableData } = location.state || {};
  const [options, setOptions] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [viewMode, setViewMode] = useState("student"); // "student" or "faculty"
  const [facultySchedules, setFacultySchedules] = useState([]);

  // 🔹 Generate timetables with proper allocation
  function generateOptions() {
    if (!timetableData) return;

    const opts = [];
    const schedule = buildSchedule(timetableData.periodTimings, timetableData.breaks);
    const subjects = timetableData.subjects || [];
    const faculties = timetableData.faculties || [];
    const rooms = timetableData.availableRooms || [];
    const batches = timetableData.batches || [];
    const specialClasses = timetableData.specialClasses || [];
    const selectedDays = timetableData.selectedDays || [];
    const maxClassesPerDay = timetableData.maxClassesPerDay || 6;

    for (let i = 0; i < 3; i++) {
      const batchSchedules = {};
      
      // Initialize schedules for all batches
      batches.forEach(batch => {
        batchSchedules[batch.name] = {};
        selectedDays.forEach(day => {
          batchSchedules[batch.name][day] = {};
          schedule.forEach(slot => {
            batchSchedules[batch.name][day][slot.index] = "FREE";
          });
        });
      });

      // Process special classes first (they have fixed slots)
      specialClasses.forEach(special => {
        if (!special.subject || !special.day || !special.start || !special.end || !special.batch) return;
        
        // Find the time slot that matches the special class timing
        const specialSlot = schedule.find(slot => 
          slot.start === special.start && slot.end === special.end
        );
        
        if (specialSlot && batchSchedules[special.batch] && batchSchedules[special.batch][special.day]) {
          // Find a faculty for this subject
          const faculty = faculties.find(f => f.subject === special.subject && 
            !f.unavailable.includes(special.day));
          
          // Find an available room
          const room = rooms.length > 0 ? rooms[Math.floor(Math.random() * rooms.length)].name : "N/A";
          
          batchSchedules[special.batch][special.day][specialSlot.index] = 
            `${special.subject} (${room})${faculty ? ` - ${faculty.name}` : ''}`;
        }
      });

      // Process regular classes
      batches.forEach(batch => {
        const subjectCounts = {};
        subjects.forEach(subject => {
          subjectCounts[subject.name] = 0;
        });

        selectedDays.forEach(day => {
          let classesToday = 0;
          
          schedule.forEach(slot => {
            if (slot.type === "break" || classesToday >= maxClassesPerDay) {
              if (slot.type === "break") {
                batchSchedules[batch.name][day][slot.index] = "BREAK";
              }
              return;
            }
            
            // Skip if already filled by special class
            if (batchSchedules[batch.name][day][slot.index] !== "FREE") {
              return;
            }
            
            // Find a subject that needs more classes this week
            const availableSubjects = subjects.filter(subject => 
              subjectCounts[subject.name] < subject.perWeek
            );
            
            if (availableSubjects.length === 0) return;
            
            // Randomly select a subject
            const subjectIndex = Math.floor(Math.random() * availableSubjects.length);
            const subject = availableSubjects[subjectIndex];
            
            // Find available faculty for this subject on this day
            const availableFaculties = faculties.filter(f => 
              f.subject === subject.name && !f.unavailable.includes(day)
            );
            
            if (availableFaculties.length === 0) return;
            
            // Select a random faculty
            const facultyIndex = Math.floor(Math.random() * availableFaculties.length);
            const faculty = availableFaculties[facultyIndex];
            
            // Find an available room
            const room = rooms.length > 0 ? rooms[Math.floor(Math.random() * rooms.length)].name : "N/A";
            
            // Assign the class
            batchSchedules[batch.name][day][slot.index] = 
              `${subject.name} (${room}) - ${faculty.name}`;
            
            subjectCounts[subject.name]++;
            classesToday++;
          });
        });
      });

      opts.push(batchSchedules);
    }

    setOptions(opts);
    setSelectedOptionIndex(0);
    generateFacultySchedules(opts[0]);
  }

  // 🔹 Generate faculty schedules from student timetable
  function generateFacultySchedules(batchSchedules) {
    if (!batchSchedules || !timetableData) return;
    
    const faculties = timetableData.faculties || [];
    const schedule = buildSchedule(timetableData.periodTimings, timetableData.breaks);
    const selectedDays = timetableData.selectedDays || [];
    
    const facultySchedulesMap = {};
    
    // Initialize faculty schedules
    faculties.forEach(faculty => {
      facultySchedulesMap[faculty.name] = {};
      selectedDays.forEach(day => {
        facultySchedulesMap[faculty.name][day] = {};
        schedule.forEach(slot => {
          facultySchedulesMap[faculty.name][day][slot.index] = "FREE";
        });
      });
    });
    
    // Populate faculty schedules from batch schedules
    Object.keys(batchSchedules).forEach(batchName => {
      selectedDays.forEach(day => {
        schedule.forEach(slot => {
          if (slot.type === "break") {
            // Mark break for all faculties
            faculties.forEach(faculty => {
              facultySchedulesMap[faculty.name][day][slot.index] = "BREAK";
            });
            return;
          }
          
          const classInfo = batchSchedules[batchName][day][slot.index];
          if (classInfo && classInfo !== "FREE" && classInfo !== "BREAK") {
            // Extract faculty name from class info (format: "Subject (Room) - Faculty")
            const facultyMatch = classInfo.match(/ - ([^-]+)$/);
            if (facultyMatch && facultyMatch[1]) {
              const facultyName = facultyMatch[1].trim();
              if (facultySchedulesMap[facultyName]) {
                facultySchedulesMap[facultyName][day][slot.index] = 
                  `${classInfo.split(' - ')[0]} - ${batchName}`;
              }
            }
          }
        });
      });
    });
    
    setFacultySchedules(facultySchedulesMap);
  }

  useEffect(() => {
    if (!timetableData) return;
    generateOptions();
  }, [timetableData]);

  useEffect(() => {
    if (options.length > 0) {
      generateFacultySchedules(options[selectedOptionIndex]);
    }
  }, [selectedOptionIndex, options]);

  // 🔹 Export Excel
  function exportExcel() {
    if (!options.length) return;

    const wb = XLSX.utils.book_new();
    const schedule = buildSchedule(timetableData.periodTimings, timetableData.breaks);

    if (viewMode === "student") {
      (timetableData.batches || []).forEach((batch) => {
        const header = ["Day", ...schedule.map((s) => `${formatTo12Hour(s.start)} - ${formatTo12Hour(s.end)}`)];
        const rows = [header];

        (timetableData.selectedDays || []).forEach((day) => {
          const row = [day];
          schedule.forEach((slot) => {
            const val = options[selectedOptionIndex]?.[batch.name]?.[day]?.[slot.index];
            row.push(slot.type === "break" ? "BREAK" : val || "FREE");
          });
          rows.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, batch.name);
      });
    } else {
      // Export faculty schedules
      Object.keys(facultySchedules).forEach((facultyName) => {
        const header = ["Day", ...schedule.map((s) => `${formatTo12Hour(s.start)} - ${formatTo12Hour(s.end)}`)];
        const rows = [header];

        (timetableData.selectedDays || []).forEach((day) => {
          const row = [day];
          schedule.forEach((slot) => {
            const val = facultySchedules[facultyName]?.[day]?.[slot.index];
            row.push(slot.type === "break" ? "BREAK" : val || "FREE");
          });
          rows.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, facultyName);
      });
    }

    XLSX.writeFile(wb, `timetable_${viewMode}.xlsx`);
  }

  if (!timetableData) {
    return <div className="error-msg">⚠ No timetable data provided. Please go back.</div>;
  }

  if (options.length === 0) {
    return <div className="loading-msg">⏳ Generating timetables...</div>;
  }

  const schedule = buildSchedule(timetableData.periodTimings, timetableData.breaks);
  const currentOption = options[selectedOptionIndex];

  return (
    <div className="timetable-page">
      <div className="timetable-container">
        <h1>Generated Timetable Options</h1>

        <div className="options-row">
          {options.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOptionIndex(idx)}
              className={selectedOptionIndex === idx ? "active" : ""}
            >
              Option {idx + 1}
            </button>
          ))}
          <button onClick={generateOptions} className="regenerate-btn">🔄 Regenerate</button>
          <button onClick={exportExcel} className="export-btn">📤 Export Excel</button>
        </div>

        <div className="view-toggle">
          <button 
            onClick={() => setViewMode("student")} 
            className={viewMode === "student" ? "active" : ""}
          >
            Student View
          </button>
          <button 
            onClick={() => setViewMode("faculty")} 
            className={viewMode === "faculty" ? "active" : ""}
          >
            Faculty View
          </button>
        </div>

        {viewMode === "student" ? (
          // Student View
          (timetableData.batches || []).map((batch) => (
            <div key={batch.name} className="batch-section">
              <h2>{batch.name}</h2>
              <table className="timetable-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {schedule.map((slot) => (
                      <th key={slot.index}>
                        {formatTo12Hour(slot.start)} - {formatTo12Hour(slot.end)}
                        {slot.type === "break" && <div className="break-label">BREAK</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(timetableData.selectedDays || []).map((day) => {
                    const daySlots = currentOption?.[batch.name]?.[day] || {};
                    return (
                      <tr key={day}>
                        <td>{day}</td>
                        {schedule.map((slot) => {
                          const cellValue = daySlots[slot.index] || "FREE";

                          if (slot.type === "break") {
                            return <td key={slot.index} className="break-cell">BREAK</td>;
                          }

                          return (
                            <td key={slot.index}>
                              <div className="timetable-cell">
                                {cellValue}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          // Faculty View
          Object.keys(facultySchedules).map((facultyName) => (
            <div key={facultyName} className="faculty-section">
              <h2>{facultyName} - {timetableData.faculties.find(f => f.name === facultyName)?.subject}</h2>
              <table className="timetable-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {schedule.map((slot) => (
                      <th key={slot.index}>
                        {formatTo12Hour(slot.start)} - {formatTo12Hour(slot.end)}
                        {slot.type === "break" && <div className="break-label">BREAK</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(timetableData.selectedDays || []).map((day) => {
                    const daySlots = facultySchedules[facultyName]?.[day] || {};
                    return (
                      <tr key={day}>
                        <td>{day}</td>
                        {schedule.map((slot) => {
                          const cellValue = daySlots[slot.index] || "FREE";

                          if (slot.type === "break") {
                            return <td key={slot.index} className="break-cell">BREAK</td>;
                          }

                          return (
                            <td key={slot.index}>
                              <div className="timetable-cell">
                                {cellValue}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}