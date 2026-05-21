"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LoginModal.module.css";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginModal({ show, onClose, onLoginSuccess }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    const { refreshUser } = useAuth();

    const router = useRouter();
    const searchParams = useSearchParams();
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;


  const getCleanRedirect = () => {
  if (typeof window === "undefined") return "/";

  const url = new URL(window.location.href);
  const existingRedirect = url.searchParams.get("redirect");

  if (existingRedirect) {
    try {
      return decodeURIComponent(existingRedirect);
    } catch {
      return existingRedirect;
    }
  }

  // ✅ ONLY path (NO domain)
  return url.pathname + url.search;
};

    const redirect = getCleanRedirect();

    // 👇 PUT IT HERE (RIGHT AFTER ALL HOOKS)
    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (!token) return;

        localStorage.setItem("token", token);

        window.history.replaceState({}, "", window.location.pathname);

        onLoginSuccess()

        refreshUser?.();
    }, []);


     useEffect(() => {
  const url = new URL(window.location.href);
  const errorParam = url.searchParams.get("error");
  const redirectParam = url.searchParams.get("redirect");

  if (!errorParam) return;

  let message = "";

  switch (errorParam) {
    case "use_password":
      message = "This account uses email & password. Please login manually.";
      break;

    case "invalid_provider":
      message = "Please login using the correct method.";
      break;

    case "no_account":
      message = "No account found. Please sign up first.";
      break;

    default:
      message = "Login failed. Try again.";
  }

  setError(message);

  // ✅ CLEAN URL BUT KEEP redirect
  const newUrl = redirectParam
    ? `${window.location.pathname}?redirect=${encodeURIComponent(redirectParam)}`
    : window.location.pathname;

  window.history.replaceState({}, "", newUrl);

}, []);


    if (!show) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API}/user/login-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem("token", data.token);

            await refreshUser();
            onClose();

            if (onLoginSuccess) {
                onLoginSuccess();
            } else {
                router.refresh();
            }

        } catch (error) {
            console.error("Login error:", error);
            alert(error.message); // ✅ show error to user

        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const redirectUrl =
            typeof window !== "undefined"
                ? window.location.href
                : "/";

        window.location.href =
            `${API}/google/google-login?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className={styles.card}>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <h2>Login</h2>
          {error && <div className={styles.errorBox}>{error}</div>}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />

                    <div className={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />

                        <span
                            className={styles.eye}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.submitBtn} ${styles.enabled}`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className={styles.divider}>OR</div>

                    <button
                        type="button"
                        className={styles.googleBtn}
                        onClick={handleGoogleLogin}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="google"
                            className={styles.googleIcon}
                        />
                        Continue with Google
                    </button>


                    <p className={styles.footer}>
                        Don’t have an account?{" "}
                        <Link href={`/sign-up?redirect=${encodeURIComponent(redirect)}`}>
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}