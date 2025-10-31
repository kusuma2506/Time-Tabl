// src/pages/Personal.jsx
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Personal.css";

function Personal() {
  const [events, setEvents] = useState([]);
  const [task, setTask] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState("none");

  const alarmRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        console.log("🔔 Notification Permission:", perm);
      });
    }
  }, []);

  const showReminder = (msg) => {
    // 🔔 Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Reminder", { body: msg });
    } else {
      alert(msg);
    }

    // 🔊 Sound
    if (alarmRef.current) {
      alarmRef.current.currentTime = 0; // reset to start
      alarmRef.current.play().catch((err) =>
        console.log("Autoplay blocked:", err)
      );
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (task && time) {
      const newEvent = { title: task, start: time, allDay: false };
      setEvents([...events, newEvent]);

      if (reminder !== "none") {
        const startTime = new Date(time.replace("T", " ") + ":00");
        if (!isNaN(startTime)) {
          const reminderMinutes = parseInt(reminder);
          const reminderTime = new Date(
            startTime.getTime() - reminderMinutes * 60000
          );
          const now = new Date();
          const delay = reminderTime.getTime() - now.getTime();

          if (delay > 0) {
            setTimeout(() => {
              showReminder(`Upcoming task: ${task} in ${reminder} minutes`);
            }, delay);
          } else {
            console.log("⚠ Reminder time already passed!");
          }
        }
      }

      setTask("");
      setTime("");
      setReminder("none");
    }
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">Personalized Planner</h1>

      <main className="personal-layout">
        <div className="task-form">
          <h2>Add Task</h2>
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Task name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />

            <label>Reminder:</label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            >
              <option value="none">No Reminder</option>
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
            </select>

            <button type="submit">Add to Calendar</button>
          </form>
        </div>

        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={true}
            editable={true}
            events={events}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </div>
      </main>

      {/* 🔊 Alarm audio */}
      <audio ref={alarmRef} src="/alarm.mp3" preload="auto"></audio>
    </div>
  );
}

export default Personal;
