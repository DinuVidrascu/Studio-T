import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { C, SERIF, SANS } from "../../utils/constants";

export default function LoginView() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError("Autentificarea a eșuat. Verifică conexiunea sau setările Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      background: "radial-gradient(circle at 10% 20%, rgba(30, 111, 100, 0.15) 0%, rgba(226, 102, 74, 0.05) 90%), #0d1117",
      color: "#f0f6fc",
      fontFamily: SANS,
      zIndex: 9999
    }}>
      {/* Abstract Background Elements */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: "30vw", height: "30vw", background: "rgba(30, 111, 100, 0.2)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "10%", width: "25vw", height: "25vw", background: "rgba(226, 102, 74, 0.15)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Login Card */}
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: 400,
        padding: "48px 40px",
        borderRadius: 24,
        background: "rgba(22, 27, 34, 0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        textAlign: "center",
        boxSizing: "border-box"
      }}>
        {/* Logo */}
        <img 
          src="/LOGO_ts_studio.svg" 
          alt="Logo" 
          style={{
            width: 90,
            height: 90,
            display: "block",
            margin: "0 auto 24px auto",
            borderRadius: 20,
            boxShadow: "0 8px 24px rgba(199, 171, 143, 0.25)",
            objectFit: "contain"
          }}
        />

        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          fontFamily: SERIF,
          margin: "0 0 8px 0",
          color: "#fff",
          letterSpacing: "-0.5px"
        }}>
          Studio
        </h1>
        <p style={{
          fontSize: 14,
          color: "rgba(240, 246, 252, 0.6)",
          margin: "0 0 36px 0",
          fontWeight: 400
        }}>
          Design System & Project Planner
        </p>

        {error && (
          <div style={{
            background: "rgba(226, 102, 74, 0.15)",
            border: "1px solid rgba(226, 102, 74, 0.3)",
            color: "#ff7b72",
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            marginBottom: 24,
            textAlign: "left"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            background: loading ? "rgba(255, 255, 255, 0.05)" : "#fff",
            color: loading ? "rgba(255, 255, 255, 0.3)" : "#0d1117",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transition: "all 0.2s ease-in-out",
            outline: "none"
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = "#f0f6fc";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,255,255,0.1)";
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {loading ? (
            <span>Se conectează...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707a5.416 5.416 0 01-.282-1.707c0-.593.102-1.17.282-1.707V4.96H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.04l3.007-2.333z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.508.453 3.44 1.346l2.582-2.581C13.463.896 11.426 0 9 0 5.004 0 1.624 2.28.957 5.58l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Conectează-te cu Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
