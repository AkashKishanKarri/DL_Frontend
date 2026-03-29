import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const EnrollCamera = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const email = searchParams.get("email");
  const name = searchParams.get("name") || "Member";

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to complete registration.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFrames = async () => {
    setIsCapturing(true);
    const frames = [];
    const numFrames = 15;

    for (let i = 0; i < numFrames; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, "image/jpeg"));
            frames.push(blob);
            setProgress(i + 1);
        }
    }

    submitFrames(frames);
  };

  const submitFrames = async (frames) => {
    const formData = new FormData();
    frames.forEach((blob, index) => {
        formData.append("files", blob, `frame_${index}.jpg`);
    });

    try {
        const response = await fetch(`${BACKEND_URL}/enroll/?uid=${uid}&email=${email}`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        alert("Face enrolled successfully! You can now login.");
        stopCamera();
        navigate("/");
    } catch (error) {
        alert("Error enrolling face (make sure at least one face is visible): " + error.message);
        setIsCapturing(false);
        setProgress(0);
    }
  };

  return (
    <div className="app-container auth-container">
        <div className="app-card text-center" style={{ marginTop: "10vh" }}>
            <h2 className="app-header">Face Enrollment</h2>
            <p style={{ color: "#6c757d", marginBottom: "20px" }}>Welcome, <b>{name}</b>. Please align your face in the camera and click start.</p>
            
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <video ref={videoRef} autoPlay playsInline muted 
                       style={{ width: "100%", maxWidth: "400px", transform: "scaleX(-1)", borderRadius: "8px", border: "2px solid #dee2e6" }}></video>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            </div>
            
            <button 
               className="app-btn app-btn-success"
               onClick={captureFrames} 
               disabled={isCapturing} 
               style={{ cursor: isCapturing ? "not-allowed" : "pointer", opacity: isCapturing ? 0.7 : 1 }}
            >
                {isCapturing ? `Capturing... ${progress}/15` : "Start Auto Capture"}
            </button>
        </div>
    </div>
  );
};

export default EnrollCamera;
