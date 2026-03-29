import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function AdminDashboard() {

    const [file, setFile] = useState(null);
    const [recognized, setRecognized] = useState([]);
    const [members, setMembers] = useState([]);
    
    // Create new attendance state
    const [selected, setSelected] = useState([]);
    const [eventName, setEventName] = useState("");
    const [domainFilter, setDomainFilter] = useState("All");
    
    // History state
    const [attendanceList, setAttendanceList] = useState([]);
    
    // Edit Modal state
    const [editingRecord, setEditingRecord] = useState(null);
    const [editSelected, setEditSelected] = useState([]);
    const [editEventName, setEditEventName] = useState("");
    const [editDomainFilter, setEditDomainFilter] = useState("All");

    const filteredMembers = members.filter(m => domainFilter === "All" || m.domain === domainFilter);
    const editFilteredMembers = members.filter(m => editDomainFilter === "All" || m.domain === editDomainFilter);

    const toggleCTM = (e) => {
        if (e.target.checked) {
            setSelected(filteredMembers.map(m => m.email || "Unknown Email"));
        } else {
            setSelected([]);
        }
    };

    const toggleEditCTM = (e) => {
        if (e.target.checked) {
            setEditSelected(editFilteredMembers.map(m => m.email || "Unknown Email"));
        } else {
            setEditSelected([]);
        }
    };

    const fetchData = () => {
        fetch(`${BACKEND_URL}/members`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMembers(data);
            })
            .catch(err => console.error("Failed to fetch members:", err));

        fetch(`${BACKEND_URL}/attendance/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAttendanceList(data);
            })
            .catch(err => console.error("Failed to fetch attendance:", err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${BACKEND_URL}/recognize/`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            const recognizedNames = data.present || data.recognized_members || [];
            
            setRecognized(recognizedNames);
            
            // Merge with already selected members
            const newSelected = [...new Set([...selected, ...recognizedNames])];
            setSelected(newSelected);
            alert(`Recognized ${recognizedNames.length} members`);
        } catch (err) {
            console.error(err);
            alert("Failed to process image");
        }
    };

    const toggleSelection = (name, isEditMode = false) => {
        if (isEditMode) {
            if (editSelected.includes(name)) {
                setEditSelected(editSelected.filter(n => n !== name));
            } else {
                setEditSelected([...editSelected, name]);
            }
        } else {
            if (selected.includes(name)) {
                setSelected(selected.filter(n => n !== name));
            } else {
                setSelected([...selected, name]);
            }
        }
    };

    const saveAttendance = async () => {
        if (!eventName) {
            alert("Please enter event name");
            return;
        }

        try {
            await fetch(`${BACKEND_URL}/attendance/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_name: eventName,
                    present: selected
                })
            });

            alert("Attendance Saved");
            setEventName("");
            setSelected([]);
            setRecognized([]);
            setFile(null);
            
            // clear file input
            const fileInput = document.getElementById('camera-upload');
            if (fileInput) fileInput.value = "";
            
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to save attendance");
        }
    };

    const deleteAttendance = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;

        try {
            await fetch(`${BACKEND_URL}/attendance/delete/${id}`, {
                method: "DELETE"
            });
            alert("Attendance Deleted");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete attendance");
        }
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setEditEventName(record.event_name);
        setEditSelected(record.present || []);
        setEditDomainFilter("All");
    };

    const closeEditModal = () => {
        setEditingRecord(null);
        setEditEventName("");
        setEditSelected([]);
    };

    const saveEditedAttendance = async () => {
        if (!editEventName) {
            alert("Please enter event name");
            return;
        }

        try {
            await fetch(`${BACKEND_URL}/attendance/update/${editingRecord.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_name: editEventName,
                    present: editSelected
                })
            });

            alert("Attendance Updated");
            closeEditModal();
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to update attendance");
        }
    };

    return (
        <div className="app-container">
            <h2 className="app-header">Admin Dashboard</h2>

            <div className="app-card">
                <h3 className="app-card-title">Mark New Attendance</h3>
                
                <div className="flex-row">
                    <div style={{ flex: 1 }}>
                        <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Event Name</b></label>
                        <input
                            type="text"
                            className="app-input"
                            placeholder="e.g., General Body Meeting"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-row" style={{ alignItems: "flex-end", marginBottom: "20px", background: "#f8f9fa", padding: "15px", borderRadius: "4px", border: "1px solid #dee2e6" }}>
                    <div style={{ flex: 2 }}>
                        <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Face Recognition (Optional)</b></label>
                        <input 
                            id="camera-upload"
                            type="file" 
                            className="app-input" 
                            style={{ marginBottom: 0 }} 
                            onChange={(e) => setFile(e.target.files[0])} 
                        />
                    </div>
                    <div>
                        <button className="app-btn" onClick={handleUpload}>
                            Upload & Recognize
                        </button>
                    </div>
                </div>

                <div className="flex-row">
                    <div style={{ flex: 1 }}>
                        <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Filter by Domain</b></label>
                        <select className="app-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                            <option value="All">All Domains</option>
                            <option value="DataVerse">DataVerse</option>
                            <option value="WebArc">WebArc</option>
                            <option value="CP">CP</option>
                            <option value="Content">Content</option>
                            <option value="Photography">Photography</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label className="checkbox-label">
                        <input type="checkbox" onChange={toggleCTM} /> 
                        <b>Select All (in current filter)</b>
                    </label>
                </div>

                <div className="member-list" style={{ maxHeight: "300px" }}>
                    {filteredMembers.map((member, index) => {
                        const email = member.email || "Unknown Email";
                        const name = member.name || "Unknown Name";

                        return (
                            <div className="member-item" key={email || index}>
                                <input
                                    type="checkbox"
                                    id={`check-${email}`}
                                    checked={selected.includes(email)}
                                    onChange={() => toggleSelection(email, false)}
                                />
                                <label htmlFor={`check-${email}`} style={{ cursor: "pointer", width: "100%" }}>
                                    {name} <span style={{ color: "#6c757d" }}>({member.domain || "No Domain"})</span> - {email}
                                </label>
                            </div>
                        );
                    })}
                    {filteredMembers.length === 0 && <div style={{ padding: "10px", color: "#6c757d" }}>No members found.</div>}
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button className="app-btn app-btn-success app-btn-inline" onClick={saveAttendance}>
                        Save Attendance
                    </button>
                    <span style={{ marginLeft: "15px", color: "#495057" }}>
                        <b>Total Selected:</b> {selected.length}
                    </span>
                </div>
            </div>

            <div className="app-card">
                <h3 className="app-card-title">Past Attendance Records</h3>
                <div className="table-container">
                    {attendanceList.length > 0 ? (
                        <table className="app-table">
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Date</th>
                                    <th>Total Present</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceList.map((record) => (
                                    <tr key={record.id}>
                                        <td>{record.event_name}</td>
                                        <td>{record.event_date}</td>
                                        <td>{record.present?.length || 0}</td>
                                        <td>
                                            <button className="app-btn app-btn-sm app-btn-inline" onClick={() => openEditModal(record)}>
                                                Edit
                                            </button>
                                            <button className="app-btn app-btn-danger app-btn-sm app-btn-inline" onClick={() => deleteAttendance(record.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: "#6c757d", margin: "10px 0" }}>No attendance records found.</p>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingRecord && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Attendance</h3>
                            <button className="close-btn" onClick={closeEditModal}>&times;</button>
                        </div>
                        
                        <div style={{ marginBottom: "15px" }}>
                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Event Name</b></label>
                            <input
                                type="text"
                                className="app-input"
                                value={editEventName}
                                onChange={(e) => setEditEventName(e.target.value)}
                            />
                        </div>

                        <div className="flex-row">
                            <div style={{ flex: 1 }}>
                                <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Filter by Domain</b></label>
                                <select className="app-select" value={editDomainFilter} onChange={(e) => setEditDomainFilter(e.target.value)}>
                                    <option value="All">All Domains</option>
                                    <option value="DataVerse">DataVerse</option>
                                    <option value="WebArc">WebArc</option>
                                    <option value="CP">CP</option>
                                    <option value="Content">Content</option>
                                    <option value="Photography">Photography</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            <label className="checkbox-label">
                                <input type="checkbox" onChange={toggleEditCTM} /> 
                                <b>Select All (in current filter)</b>
                            </label>
                        </div>

                        <div className="member-list">
                            {editFilteredMembers.map((member, index) => {
                                const email = member.email || "Unknown Email";
                                const name = member.name || "Unknown Name";

                                return (
                                    <div className="member-item" key={email || index}>
                                        <input
                                            type="checkbox"
                                            id={`edit-check-${email}`}
                                            checked={editSelected.includes(email)}
                                            onChange={() => toggleSelection(email, true)}
                                        />
                                        <label htmlFor={`edit-check-${email}`} style={{ cursor: "pointer", width: "100%" }}>
                                            {name} <span style={{ color: "#6c757d" }}>({member.domain || "No Domain"})</span> - {email}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                            <span style={{ color: "#495057" }}>
                                <b>Present:</b> {editSelected.length}
                            </span>
                            <div>
                                <button className="app-btn app-btn-secondary app-btn-inline" style={{ marginRight: "10px" }} onClick={closeEditModal}>
                                    Cancel
                                </button>
                                <button className="app-btn app-btn-success app-btn-inline" onClick={saveEditedAttendance}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
