import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import Register from "./Register";
import EnrollCamera from "./EnrollCamera";
import MemberDashboard from "./MemberDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/enroll-camera" element={<EnrollCamera />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;