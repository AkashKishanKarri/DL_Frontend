import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function MemberDashboard() {

    const [attendance, setAttendance] = useState([]);
    const [email, setEmail] = useState("");

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {

            if (user) {
                setEmail(user.email);
            }

        });

        fetch(`${BACKEND_URL}/attendance/`)
            .then(res => res.json())
            .then(data => {
                setAttendance(data);
            });

        return () => unsubscribe();

    }, []);
    console.log("hello");

    return (
        <div>

            <h1>Member Dashboard</h1>

            <h3>Your Attendance ({email || "Loading user..."})</h3>

            {attendance
                .filter(record => {
                    if (!record.present || !email) return false;
                    return record.present.some(e => e.toLowerCase() === email.toLowerCase());
                })
                .map((record, index) => (
                    <div key={index} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
                        <b>Event:</b> {record.event_name} <br />
                        <b>Date:</b> {record.event_date} <br />
                        <span style={{ color: "green", fontWeight: "bold" }}>Status: Present</span>
                    </div>
                ))}

            {email && attendance.filter(record => {
                if (!record.present) return false;
                return record.present.some(e => e.toLowerCase() === email.toLowerCase());
            }).length === 0 && (
                    <p>No attendance records found for {email}.</p>
                )}

        </div>
    );
}

export default MemberDashboard;