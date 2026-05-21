"use client";

import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import styles from "./EditProfile.module.css";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function EditProfile() {

    const { user, setUser } = useAuth();

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const API = process.env.NEXT_PUBLIC_API_BASE_URL;

    console.log("🚀 User data in EditProfile:", user);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "",
        mobileNumber: "",
        roleDescription: "",
        otherRoleDescription: "",
        organizationName: "",
    });

    // Prefill user data
    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: `${user.countryCode || ""}${user.mobileNumber || ""}`,
                countryCode: user.countryCode || "",
                mobileNumber: user.mobileNumber || "",
                roleDescription: user.roleDescription || "",
                otherRoleDescription: user.otherRoleDescription || "",
                organizationName: user.organizationName || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value, country) => {
        setForm({
            ...form,
            phone: value,
            countryCode: "+" + country.dialCode,
            mobileNumber: value.slice(country.dialCode.length)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                countryCode: form.countryCode,
                mobileNumber: form.mobileNumber,
                roleDescription: form.roleDescription,
                otherRoleDescription: form.otherRoleDescription,
                organizationName: form.organizationName,
            };

            const res = await fetch(`${API}/user/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {

                setUser(data.response);

                localStorage.setItem("user", JSON.stringify(data.response));

                alert("Profile updated ✅");

                router.push("/");

            } else {
                alert(data.message || "Update failed");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>

            {/* LEFT SIDE */}
            <div className={styles.left}>
                <h1>
                    Manage your <br />
                    <span>profile</span>
                </h1>
                <p>Keep your details up to date.</p>
            </div>

            {/* RIGHT SIDE */}
            <div className={styles.right}>
                <form onSubmit={handleSubmit} className={styles.card}>
                    <h2>Edit Profile</h2>

                    {/* NAME */}
                    <div className={styles.nameRow}>
                        <input
                            name="firstName"
                            className={styles.input}
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                        />

                        <input
                            name="lastName"
                            className={styles.input}
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* PHONE */}
                    <div className={styles.phoneWrapper}>
                        <PhoneInput
                            country={"in"}
                            value={form.phone}
                            onChange={handlePhoneChange}
                            inputClass={styles.phoneInput}
                            containerClass={styles.phoneContainer}
                            buttonClass={styles.phoneDropdown}
                            dropdownClass={styles.phoneDropdownList}
                            countryCodeEditable={false}
                        />
                    </div>

                    {/* EMAIL (disabled) */}
                    <input
                        name="email"
                        className={styles.input}
                        value={form.email}
                        disabled
                    />

                    {/* PASSWORD */}
                    {/* <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={styles.input}
              placeholder="New Password (optional)"
              onChange={handleChange}
            />

            <span
              className={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div> */}

                    {/* ROLE */}
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
                            value={form.otherRoleDescription}
                            onChange={handleChange}
                        />
                    )}

                    {/* ORGANIZATION */}
                    <input
                        name="organizationName"
                        className={styles.input}
                        placeholder="School/Organization Name"
                        value={form.organizationName}
                        onChange={handleChange}
                    />

                    {/* SUBMIT */}
                    <button
                        className={`${styles.submitBtn} ${styles.enabled}`}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}