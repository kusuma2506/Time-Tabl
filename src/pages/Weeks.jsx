import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Weeks.css";

export default function Weeks() {
  const navigate = useNavigate();
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState([]);
  const [numPeriods, setNumPeriods] = useState(0);
  const [periodTimings, setPeriodTimings] = useState({});
  const [breaks, setBreaks] = useState([]);
  const [subjects, setSubjects] = useState([{ name: "", perWeek: "" }]);
  const [faculties, setFaculties] = useState([{ name: "", subject: "", unavailable: [] }]);
  const [availableRooms, setAvailableRooms] = useState([{ name: "" }]); // Removed capacity
  const [batches, setBatches] = useState([{ name: "" }]);
  const [specialClasses, setSpecialClasses] = useState([
    { subject: "", day: "", start: "", end: "", batch: "" },
  ]);
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(6);
  const [errors, setErrors] = useState({});

  // 🔹 Helpers
  const toggleDay = (day) => {
    setSelectedDays(
      selectedDays.includes(day)
        ? selectedDays.filter((d) => d !== day)
        : [...selectedDays, day]
    );
  };

  const handlePeriodChange = (periodIndex, type, value) => {
    setPeriodTimings({
      ...periodTimings,
      [periodIndex]: { ...periodTimings[periodIndex], [type]: value },
    });
  };

  const handleBreakChange = (breakIndex, type, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[breakIndex] = { ...updatedBreaks[breakIndex], [type]: value };
    setBreaks(updatedBreaks);
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleFacultyChange = (index, field, value) => {
    const updated = [...faculties];
    updated[index][field] = value;
    setFaculties(updated);
  };

  
const handleFacultyUnavailable = (facultyIndex, e) => {
  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
  const updated = [...faculties];
  updated[facultyIndex].unavailable = selectedOptions;
  setFaculties(updated);
};

// Add this new function:
const toggleFacultyUnavailable = (facultyIndex, day) => {
  const updated = [...faculties];
  const unavailable = updated[facultyIndex].unavailable;
  
  if (unavailable.includes(day)) {
    updated[facultyIndex].unavailable = unavailable.filter(d => d !== day);
  } else {
    updated[facultyIndex].unavailable = [...unavailable, day];
  }
  
  setFaculties(updated);
};


  const handleRoomChange = (index, value) => {
    const rooms = [...availableRooms];
    rooms[index].name = value;
    setAvailableRooms(rooms);
  };

  const handleBatchChange = (index, field, value) => {
    const updated = [...batches];
    updated[index][field] = value;
    setBatches(updated);
  };

  const handleSpecialChange = (index, field, value) => {
    const updated = [...specialClasses];
    updated[index][field] = value;
    setSpecialClasses(updated);
  };

  // 🔹 Add/Remove
  const addSubject = () => setSubjects([...subjects, { name: "", perWeek: "" }]);
  const removeSubject = (index) =>
    setSubjects(subjects.filter((_, i) => i !== index));

  const addFaculty = () =>
    setFaculties([...faculties, { name: "", subject: "", unavailable: [] }]);
  const removeFaculty = (index) =>
    setFaculties(faculties.filter((_, i) => i !== index));

  const addRoom = () => setAvailableRooms([...availableRooms, { name: "" }]); // Removed capacity
  const removeRoom = (index) =>
    setAvailableRooms(availableRooms.filter((_, i) => i !== index));

  const addBatch = () => setBatches([...batches, { name: "" }]);
  const removeBatch = (index) =>
    setBatches(batches.filter((_, i) => i !== index));

  const addBreak = () => setBreaks([...breaks, { start: "", end: "" }]);
  const removeBreak = (index) => setBreaks(breaks.filter((_, i) => i !== index));

  const addSpecial = () =>
    setSpecialClasses([...specialClasses, { subject: "", day: "", start: "", end: "", batch: "" }]);
  const removeSpecial = (index) =>
    setSpecialClasses(specialClasses.filter((_, i) => i !== index));

  // 🔹 Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1 && selectedDays.length === 0) {
      newErrors.days = "Select at least one day";
    }
    
    if (step === 2) {
      if (numPeriods <= 0) newErrors.periods = "Number of periods must be greater than 0";
      
      // Validate period timings
      for (let i = 1; i <= numPeriods; i++) {
        if (!periodTimings[i]?.start || !periodTimings[i]?.end) {
          newErrors.periodTimings = "All periods must have start and end times";
          break;
        }
      }
    }
    
    if (step === 3) {
      subjects.forEach((sub, idx) => {
        if (!sub.name) newErrors[`subjectName_${idx}`] = "Subject name is required";
        if (!sub.perWeek || sub.perWeek < 1) newErrors[`subjectPerWeek_`] = "Classes per week must be at least 1";
      });
    }
    
    if (step === 4) {
      faculties.forEach((fac, idx) => {
        if (!fac.name) newErrors[`facultyName_${idx}`] = "Faculty name is required";
        if (!fac.subject) newErrors[`facultySubject_${idx}`] = "Faculty subject is required";
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Final Submit
  const handleSubmit = () => {
    if (validateStep(6)) {
      const timetableData = {
        selectedDays,
        numPeriods,
        periodTimings,
        breaks,
        subjects,
        faculties,
        availableRooms,
        batches,
        specialClasses,
        maxClassesPerDay,
      };
      navigate("/timetable", { state: { timetableData } });
    }
  };

  // Step 1 - Days
  if (step === 1) {
    return (
      <div className="weeks-page">
        <h1 className="page-heading">📅 Timetable Generator</h1>
        <div className="step-card">
          <h2>Select Days for Timetable</h2>
          {errors.days && <div className="error">{errors.days}</div>}
          <div className="days-grid">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                className={`day-btn ${selectedDays.includes(day) ? "selected" : ""}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="nav-buttons">
            <span />
            <button
              className="next-btn"
              onClick={() => {
                if (validateStep(1)) setStep(2);
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Periods & Breaks
  if (step === 2) {
    return (
      <div className="weeks-page">
        <h1 className="page-heading">📅 Timetable Generator</h1>
        <div className="step-card">
          <h2>Set Periods and Breaks</h2>
          
          {errors.periods && <div className="error">{errors.periods}</div>}
          {errors.periodTimings && <div className="error">{errors.periodTimings}</div>}
          
          <label>
            Number of Periods:
            <input
              type="number"
              min="1"
              max="12"
              value={numPeriods}
              onChange={(e) => setNumPeriods(parseInt(e.target.value) || 0)}
            />
          </label>

          {numPeriods > 0 && (
            <>
              <h3>Period Timings</h3>
              {Array.from({ length: numPeriods }, (_, i) => i + 1).map((p) => (
                <div key={p} className="period-row">
                  <span>Period {p}:</span>
                  <input
                    type="time"
                    value={periodTimings[p]?.start || ""}
                    onChange={(e) =>
                      handlePeriodChange(p, "start", e.target.value)
                    }
                  />
                  <input
                    type="time"
                    value={periodTimings[p]?.end || ""}
                    onChange={(e) =>
                      handlePeriodChange(p, "end", e.target.value)
                    }
                  />
                </div>
              ))}
            </>
          )}

          <h3>Breaks</h3>
          {breaks.map((breakItem, idx) => (
            <div key={idx} className="break-row">
              <span>Break {idx + 1}:</span>
              <input
                type="time"
                value={breakItem.start || ""}
                onChange={(e) => handleBreakChange(idx, "start", e.target.value)}
              />
              <input
                type="time"
                value={breakItem.end || ""}
                onChange={(e) => handleBreakChange(idx, "end", e.target.value)}
              />
              <button onClick={() => removeBreak(idx)}>
                Remove
              </button>
            </div>
          ))}
          <button className="proceed-btn" onClick={addBreak}>
            Add Break
          </button>

          <div className="nav-buttons">
            <button className="prev-btn" onClick={() => setStep(1)}>
              Previous
            </button>
            <button
              className="next-btn"
              onClick={() => {
                if (validateStep(2)) setStep(3);
              }}
            >
              Next: Subjects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3 - Subjects
  if (step === 3) {
    return (
      <div className="weeks-page">
        <h1 className="page-heading">📅 Timetable Generator</h1>
        <div className="step-card">
          <h2>Enter Subjects</h2>
          {subjects.map((sub, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                placeholder="Subject Name"
                value={sub.name}
                onChange={(e) =>
                  handleSubjectChange(index, "name", e.target.value)
                }
                className={errors[`subjectName_${index}`] ? "error-input" : ""}
              />
              {errors[`subjectName_${index}`] && <span className="error-text">{errors[`subjectName_${index}`]}</span>}
              
              <input
                type="number"
                placeholder="Classes/Week"
                min="1"
                value={sub.perWeek}
                onChange={(e) =>
                  handleSubjectChange(index, "perWeek", e.target.value)
                }
                className={errors[`subjectPerWeek_${index}`] ? "error-input" : ""}
              />
              {errors[`subjectPerWeek_${index}`] && <span className="error-text">{errors[`subjectPerWeek_`]}</span>}
              
              <button onClick={() => removeSubject(index)}>Remove</button>
            </div>
          ))}
          <button className="proceed-btn" onClick={addSubject}>
            Add Subject
          </button>
          <div className="nav-buttons">
            <button className="prev-btn" onClick={() => setStep(2)}>
              Previous
            </button>
            <button className="next-btn" onClick={() => {
              if (validateStep(3)) setStep(4);
            }}>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4 - Faculty with Select Options for Unavailability
  // Step 4 - Faculty with Button Grid for Unavailability
if (step === 4) {
  return (
    <div className="weeks-page">
      <h1 className="page-heading">📅 Timetable Generator</h1>
      <div className="step-card">
        <h2>Enter Faculty</h2>
        
        {faculties.map((f, index) => (
          <div key={index} className="faculty-card">
            <div className="input-row">
              <input
                type="text"
                placeholder="Faculty Name"
                value={f.name}
                onChange={(e) => handleFacultyChange(index, "name", e.target.value)}
                className={errors[`facultyName_${index}`] ? "error-input" : ""}
              />
              {errors[`facultyName_${index}`] && <span className="error-text">{errors[`facultyName_${index}`]}</span>}
              
              <select
                value={f.subject}
                onChange={(e) => handleFacultyChange(index, "subject", e.target.value)}
                className={errors[`facultySubject_${index}`] ? "error-input" : ""}
              >
                <option value="">Select Subject</option>
                {subjects.map((s, i) => (
                  <option key={i} value={s.name}>{s.name}</option>
                ))}
              </select>
              {errors[`facultySubject_${index}`] && <span className="error-text">{errors[`facultySubject_${index}`]}</span>}
              
              <button onClick={() => removeFaculty(index)}>Remove</button>
            </div>
            
            <div className="unavailability-section">
              <label>Unavailable Days:</label>
              <div className="days-grid-small">
                {selectedDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-btn-small ${f.unavailable.includes(day) ? "selected" : ""}`}
                    onClick={() => toggleFacultyUnavailable(index, day)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
              <div className="selected-unavailable">
                {f.unavailable.length > 0 ? (
                  <>
                    <span>Unavailable on: </span>
                    {f.unavailable.map(day => (
                      <span key={day} className="unavailable-tag">{day.substring(0, 3)}</span>
                    ))}
                  </>
                ) : (
                  <span className="no-unavailable">Available all selected days</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <button className="proceed-btn" onClick={addFaculty}>
          Add Faculty
        </button>
        
        <div className="nav-buttons">
          <button className="prev-btn" onClick={() => setStep(3)}>
            Previous
          </button>
          <button className="next-btn" onClick={() => {
            if (validateStep(4)) setStep(5);
          }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
  // Step 5 - Rooms (with capacity removed)
  if (step === 5) {
    return (
      <div className="weeks-page">
        <h1 className="page-heading">📅 Timetable Generator</h1>
        <div className="step-card">
          <h2>Enter Available Rooms</h2>
          {availableRooms.map((room, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                placeholder={`Room Name`}
                value={room.name}
                onChange={(e) => handleRoomChange(index, e.target.value)}
              />
              <button onClick={() => removeRoom(index)}>Remove</button>
            </div>
          ))}
          <button className="proceed-btn" onClick={addRoom}>
            Add Room
          </button>
          
          <div className="input-row">
            <label>
              Maximum Classes Per Day:
              <input
                type="number"
                min="1"
                max="12"
                value={maxClassesPerDay}
                onChange={(e) => setMaxClassesPerDay(parseInt(e.target.value))}
              />
            </label>
          </div>
          
          <div className="nav-buttons">
            <button className="prev-btn" onClick={() => setStep(4)}>
              Previous
            </button>
            <button className="next-btn" onClick={() => setStep(6)}>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6 - Batches + Specials
  if (step === 6) {
    return (
      <div className="weeks-page">
        <h1 className="page-heading">📅 Timetable Generator</h1>
        <div className="step-card">
          <h2>Enter Student Batches</h2>
          {batches.map((batch, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                placeholder={`Batch Name`}
                value={batch.name}
                onChange={(e) => handleBatchChange(index, "name", e.target.value)}
              />
              <button onClick={() => removeBatch(index)}>Remove</button>
            </div>
          ))}
          <button className="proceed-btn" onClick={addBatch}>
            Add Batch
          </button>

          <h2 style={{ marginTop: "20px" }}>Special Fixed-Slot Classes</h2>
          {specialClasses.map((s, index) => (
            <div key={index} className="input-row">
              <select
                value={s.subject}
                onChange={(e) => handleSpecialChange(index, "subject", e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((sub, i) => (
                    <option key={i} value={sub.name}>{sub.name}</option>
                  ))}
              </select>
              
              <select
                value={s.day}
                onChange={(e) => handleSpecialChange(index, "day", e.target.value)}
              >
                <option value="">Select Day</option>
                {selectedDays.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>
              
              <input
                type="time"
                value={s.start}
                onChange={(e) => handleSpecialChange(index, "start", e.target.value)}
              />
              <input
                type="time"
                value={s.end}
                onChange={(e) => handleSpecialChange(index, "end", e.target.value)}
              />

              <select
                value={s.batch}
                onChange={(e) => handleSpecialChange(index, "batch", e.target.value)}
              >
                <option value="">Select Batch</option>
                {batches.map((b, i) => (
                    <option key={i} value={b.name}>{b.name}</option>
                  ))}
              </select>

              <button onClick={() => removeSpecial(index)}>Remove</button>
            </div>
          ))}
          <button className="proceed-btn" onClick={addSpecial}>
            Add Special Class
          </button>

          <div className="nav-buttons">
            <button className="prev-btn" onClick={() => setStep(5)}>
              Previous
            </button>
            <button className="next-btn" onClick={handleSubmit}>
              Generate Timetable
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}