import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [domain, setDomain] = useState("DataVerse");
    const [yearOfStudy, setYearOfStudy] = useState("");
    const [role, setRole] = useState("member");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "members", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                domain: domain,
                year_of_study: yearOfStudy,
                role: role
            });

            alert("Registration successful");
            navigate(`/enroll-camera?uid=${user.uid}&email=${email}&name=${name}`);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="app-container auth-container">
            <div className="app-card" style={{ padding: "30px", marginTop: "10vh", textAlign: "center" }}>
                <h2 className="app-header" style={{ marginBottom: "20px" }}>Register Member</h2>

                <div style={{ textAlign: "left" }}>
                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Name</b></label>
                    <input type="text" className="app-input" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} />

                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Email</b></label>
                    <input type="email" className="app-input" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />

                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Domain</b></label>
                    <select className="app-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                        <option value="WebArcs">WebArcs</option>
                        <option value="DataVerse">DataVerse</option>
                        <option value="photography">photography</option>
                        <option value="CP">CP</option>
                        <option value="content">content</option>
                    </select>

                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Year of Study</b></label>
                    <input type="text" className="app-input" placeholder="Enter Year" onChange={(e) => setYearOfStudy(e.target.value)} />

                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Role</b></label>
                    <select className="app-select" onChange={(e) => setRole(e.target.value)}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>

                    <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Password</b></label>
                    <input type="password" className="app-input" placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="app-btn mt-3" onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
}

export default Register;