"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import styles from "./SignUp.module.css";
import "react-phone-input-2/lib/style.css";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUp() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [step, setStep] = useState("form");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    roleDescription: "",
    otherRoleDescription: "",
    organizationName: "",
  });

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);


  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/login";


 useEffect(() => {
  const email = searchParams.get("email");
  const signup = searchParams.get("signup") || searchParams.get("sign-up");
  const errorParam = searchParams.get("error");

  if (email) {
    setForm((prev) => ({ ...prev, email }));
  }

  // ✅ SUCCESS CASE
  if (signup === "success") {
    setShowGoogleModal(true);
    setStep("google");
    setSuccess("Complete your profile");
    setError("");
  }

  // ✅ ERROR CASES
  if (errorParam) {
    let message = "";

    switch (errorParam) {
      case "local_exists":
        message = "Account already exists with email & password. Please login.";
        break;

      case "google_exists":
        message = "Account already exists with Google. Please login using Google.";
        break;

      case "exists":
        message = "Account already exists. Please login.";
        break;

      default:
        message = "Something went wrong. Try again.";
    }

    setError(message);
    setSuccess("");
  }

  // ✅ CLEAN URL BUT KEEP redirect
  if (email || signup || errorParam) {
    const redirect = searchParams.get("redirect");

    const newUrl = redirect
      ? `${window.location.pathname}?redirect=${encodeURIComponent(redirect)}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }
}, [searchParams]);




  // const postLoginRedirect = signupSuccess ? null : redirect;
  // ✅ Handle Input
  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value, data) => {
    const dialCode = data.dialCode || "";

    // Remove country code safely
    let phoneNumber = value;

    if (value.startsWith(dialCode)) {
      phoneNumber = value.slice(dialCode.length);
    }

    // Keep only digits
    phoneNumber = phoneNumber.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      phone: phoneNumber ? Number(phoneNumber) : "", // ✅ number
      countryCode: `+${dialCode}`,                  // ✅ separate
    }));
  };

  const handleOtpChange = (value, index) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return; // ✅ allow letters + numbers

    setError("");
    setSuccess("");

    const newOtp = [...otp];
    newOtp[index] = value; // optional: normalize
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

  // ✅ Send OTP
  const handleSendOtp = async () => {
    if (!form.email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      setSendingOtp(true);

      const res = await fetch(`${API}/user/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setSuccess("OTP sent successfully to email ✅");
      setError("");

      setStep("otp");

      // ✅ Start timer
      setTimer(30);
      setCanResend(false);

    } catch {
      setError("Error sending OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    let interval;

    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setError("Please enter the complete OTP.");
      setSuccess("");
      return;
    }

    try {
      const res = await fetch(`${API}/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: enteredOtp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Email verified successfully ✅");
        setError("");
        setEmailVerified(true);
        setStep("verified");
      } else {
        setError(data.message || "Invalid OTP");
        setSuccess("");
      }
    } catch {
      setError("Verification failed");
      setSuccess("");
    }
  };

  // ✅ Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setError("Please verify your email first ❌");
      setSuccess("");
      return;
    }

    // if (!form.userType) {
    //   return alert("Select user type");
    // }

    setLoading(true);

    try {
      const res = await fetch(`${API}/user/signup-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        // alert("Signup successful ✅");
        window.location.href = redirect;
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("❌ Signup Error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const redirectUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "/";

    window.location.href =
      `${API}/google/google-signup?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // =========================
  // ✅ GOOGLE COMPLETE PROFILE
  // =========================
const handleCompleteProfile = async () => {
  try {
    if (!form.email) {
      setError("Email is missing. Please try again.");
      return;
    }

    const res = await fetch(`${API}/user/complete-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        phone: Number(form.phone),
        countryCode: form.countryCode || "+91",
        roleDescription: form.roleDescription,
        otherRoleDescription: form.otherRoleDescription || "",
        organizationName: form.organizationName,
      }),
    });

    const data = await res.json();

if (data.success) {

  let finalRedirect = "/login";

  // ✅ close modal first
  setShowGoogleModal(false);

  // optional cleanup
  setStep("form");
  setError("");
  setSuccess("");

  console.log("REDIRECTING TO:", finalRedirect);

  // ✅ correct Next.js navigation
  router.replace(finalRedirect);
}
 else {
      setError(data.message || "Something went wrong");
    }
  } catch (err) {
    console.error("Complete profile error:", err);
    setError("Something went wrong");
  }
};

  return (
    <div className={styles.container}>
      {/* LEFT */}
      <div className={styles.left}>
        <h1>
          Crafting your <br />
          <span>scholarly</span> future.
        </h1>
        <p>Join a sanctuary designed for focused learning.</p>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <form onSubmit={handleSubmit} className={styles.card}>
          <h2>Create Account</h2>

          {/* NAME */}
          <div className={styles.nameRow}>
            <input
              name="firstName"
              className={styles.input}
              placeholder="First Name"
              onChange={handleChange}
            />

            <input
              name="lastName"
              className={styles.input}
              placeholder="Last Name"
              onChange={handleChange}
            />
          </div>

          {/* PHONE */}
          <div className={styles.phoneWrapper}>
            <PhoneInput
              country={"in"}
              value={
                form.countryCode
                  ? form.countryCode.replace("+", "") + form.phone
                  : form.phone
              }
              onChange={handlePhoneChange}
              inputClass={styles.phoneInput}
              containerClass={styles.phoneContainer}
              buttonClass={styles.phoneDropdown}
              dropdownClass={styles.phoneDropdownList}
              countryCodeEditable={false}
            />
          </div>

          {/* EMAIL */}
          <div className={styles.emailWrapper}>
            <input
              name="email"
              className={styles.input}
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
              disabled={emailVerified} // ✅ disable after verification
            />

            {!emailVerified ? (
              <button
                type="button"
                className={styles.verifyBtn}
                onClick={handleSendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Sending..." : "Verify"}
              </button>
            ) : (
              <div className={styles.verifiedBadge}>
                ✔ Verified
              </div>
            )}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          {/* OTP */}
          {step === "otp" && (
            <div className={styles.otpBox}>
              <div className={styles.otpInputs}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                  />
                ))}
              </div>

              <button
                type="button"
                className={styles.verifyOtpBtn}
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </button>

              {/* 🔥 NEW RESEND SECTION */}
              <div className={styles.resendBox}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className={styles.resendBtn}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className={styles.timerText}>
                    Resend OTP in {timer}s
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PASSWORD */}
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={styles.input}
              placeholder="Password"
              disabled={!emailVerified}
              onChange={handleChange}
            />

            <span
              className={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <select
            name="roleDescription"
            className={styles.input}
            value={form.roleDescription}
            onChange={handleChange}
            disabled={!emailVerified}
          >
            <option value="">Select your role</option>
            <option value="Teacher">Teacher</option>
            <option value="School Leader">School Leader</option>
            <option value="Education Solution Partner">Education Solution Partner</option>
            <option value="Education Consultants">Education Consultants</option>
            <option value="Other">Other</option>
          </select>

          {form.roleDescription === "Other" && (
            <input
              name="otherRoleDescription"
              className={styles.input}
              placeholder="Specify your role"
              onChange={handleChange}
            />
          )}

          <input
            name="organizationName"
            className={styles.input}
            placeholder="School/Organization Name"
            onChange={handleChange}
            disabled={!emailVerified}
          />

          {/* SUBMIT */}
          <button
            className={`${styles.submitBtn} ${emailVerified ? styles.enabled : styles.disabled
              }`}
            disabled={!emailVerified || loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <div className={styles.divider}>OR</div>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleSignup}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="google"
              className={styles.googleIcon}
            />
            Continue with Google
          </button>

          <p className={styles.footer}>
            Already have account? <a href="/login">Login</a>
          </p>
        </form>

      </div>

      {showGoogleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Complete Your Profile 🚀</h3>
            <p>Please fill remaining details</p>

            {/* PHONE */}
            <div className={styles.phoneWrapper}>
              <PhoneInput
                country={"in"}
                value={
                  form.countryCode
                    ? form.countryCode.replace("+", "") + form.phone
                    : form.phone
                }
                onChange={handlePhoneChange}
                inputClass={styles.phoneInput}
                containerClass={styles.phoneContainer}
                buttonClass={styles.phoneDropdown}
                dropdownClass={styles.phoneDropdownList}
                countryCodeEditable={false}
              />
            </div>

            <select
              name="roleDescription"
              className={styles.input}
              value={form.roleDescription}
              onChange={handleChange}
            >
              <option value="">Select your role</option>
              <option value="Teacher">Teacher</option>
              <option value="School Leader">School Leader</option>
              <option value="Education Solution Partner">Education Solution Partner</option>
              <option value="Education Consultants">Education Consultants</option>
              <option value="Other">Other</option>
            </select>

            {form.roleDescription === "Other" && (
              <input
                name="otherRoleDescription"
                className={styles.input}
                placeholder="Specify your role"
                onChange={handleChange}
              />
            )}

            {/* ORGANIZATION */}
            <input
              name="organizationName"
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={handleChange}
              className={styles.input}
            />

            <button
              className={styles.modalBtn}
              onClick={handleCompleteProfile}
            >
              Complete Signup
            </button>
          </div>
        </div>
      )}
    </div>

  );
}