import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [role, setRole] = useState("member");

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const docRef = doc(db, "members", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const role = docSnap.data().role;

                if (role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/member");
                }
            } else {
                alert("User role not found in database");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "members", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                domain: domain,
                role: role
            });

            alert("Registration successful. Please enroll your face.");
            window.location.href = `/enroll-camera?uid=${user.uid}&email=${email}&name=${name}`;
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="app-container auth-container">
            <div className="app-card" style={{ padding: "40px 30px", marginTop: "10vh", textAlign: "center" }}>
                {!isRegister ? (
                    <>
                        <h2 className="app-header" style={{ marginBottom: "20px" }}>Login</h2>

                        <div style={{ textAlign: "left" }}>
                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Email</b></label>
                            <input type="email" className="app-input" placeholder="Enter Email"
                                onChange={(e) => setEmail(e.target.value)} />

                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Password</b></label>
                            <input type="password" className="app-input" placeholder="Enter Password"
                                onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <button className="app-btn mt-3" onClick={handleLogin}>Login</button>

                        <div className="mt-4" style={{ color: "#6c757d" }}>
                            New member?
                            <button className="app-btn-secondary" onClick={() => setIsRegister(true)}>Register here</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="app-header" style={{ marginBottom: "20px" }}>Register</h2>

                        <div style={{ textAlign: "left" }}>
                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Name</b></label>
                            <input type="text" className="app-input" placeholder="Enter Name"
                                onChange={(e) => setName(e.target.value)} />

                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Email</b></label>
                            <input type="email" className="app-input" placeholder="Enter Email"
                                onChange={(e) => setEmail(e.target.value)} />

                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Domain</b></label>
                            <select className="app-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                                <option value="DataVerse">DataVerse</option>
                                <option value="WebArcs">WebArcs</option>
                                <option value="CP">CP</option>
                                <option value="Content">Content</option>
                                <option value="Photography">Photography</option>
                            </select>

                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Role</b></label>
                            <select className="app-select" onChange={(e) => setRole(e.target.value)}>
                                <option value="member">Member</option>
                                <option value="admin">Lead</option>
                            </select>

                            <label className="checkbox-label" style={{ marginBottom: "5px" }}><b>Password</b></label>
                            <input type="password" className="app-input" placeholder="Enter Password"
                                onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <button className="app-btn mt-3" onClick={handleRegister}>Register</button>

                        <div className="mt-4" style={{ color: "#6c757d" }}>
                            Already have an account?
                            <button className="app-btn-secondary" onClick={() => setIsRegister(false)}>Login</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;