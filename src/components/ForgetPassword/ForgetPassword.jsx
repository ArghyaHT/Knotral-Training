"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./ForgetPassword.module.css";

export default function ForgetPassword() {

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [step, setStep] = useState("email");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SEND OTP ================= */

  const handleSendOtp = async () => {

    if (!form.email) return alert("Enter email");

    try {

      setSendingOtp(true);

      const res = await fetch(`${API}/user/send-forget-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("OTP sent ✅");

      setStep("otp");
      setTimer(30);
      setCanResend(false);

    } catch {
      alert("Error sending OTP");
    }
    finally {
      setSendingOtp(false);
    }
  };

  /* ================= OTP TIMER ================= */

  useEffect(() => {

    let interval;

    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);

  }, [timer, step]);

  /* ================= OTP INPUT ================= */

  const handleOtpChange = (value, index) => {

    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

  };

  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOtp = async () => {

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      return alert("Enter full OTP");
    }

    try {

      const res = await fetch(`${API}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: enteredOtp
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP verified ✅");
        setStep("password");
      } else {
        alert(data.message);
      }

    } catch {
      alert("Verification failed");
    }

  };

  /* ================= RESET PASSWORD ================= */

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {

      const res = await fetch(`${API}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (data.success) {

        // clear auth data
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        alert("Password reset successful ✅");
        window.location.href = "/login";
      } else {
        alert(data.message);
      }

    }
    catch {
      alert("Server error");
    }

  };

  return (

    <div className={styles.container}>

      <div className={styles.card}>

        <h2>Reset Password</h2>

        {/* EMAIL STEP */}

        {step === "email" && (

          <>
            <input
              name="email"
              placeholder="Enter email"
              className={styles.input}
              onChange={handleChange}
            />

            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className={styles.submitBtn}
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </>

        )}

        {/* OTP STEP */}

        {step === "otp" && (

          <div className={styles.otpBox}>

            <div className={styles.otpInputs}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => inputsRef.current[i] = el}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              className={styles.submitBtn}
            >
              Verify OTP
            </button>

            <div className={styles.resendBox}>
              {canResend ?
                <button onClick={handleSendOtp}>Resend OTP</button>
                :
                <p>Resend OTP in {timer}s</p>
              }
            </div>

          </div>

        )}

        {/* PASSWORD STEP */}

        {step === "password" && (

          <form onSubmit={handleResetPassword}>

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New Password"
                className={styles.input}
                onChange={handleChange}
              />

              <span
                className={styles.eye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={styles.input}
              onChange={handleChange}
            />

            <button className={styles.submitBtn}>
              Reset Password
            </button>

          </form>

        )}

      </div>

    </div>

  );

}