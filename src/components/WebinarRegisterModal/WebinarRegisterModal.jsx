"use client";
import React, { useEffect, useState } from "react";
import styles from "./WebinarRegisterModal.module.css";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WebinarRegisterModal({
    webinar,
    user,
    onClose,
    // onConfirm,
    // isSubmitting,
    utms
}) {
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!webinar) return null;

    const router = useRouter();

    const cleanTime = webinar.startTime.replace(" IST", "");

    // Load Razorpay script
    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Generate payload for submission
    const getSubmitPayload = () => {
        const payload = {
            First_Name: user.firstName,
            Last_Name: user.lastName,
            Email: user.email,
            Mobile: `${user.countryCode}${user.mobileNumber}`,
            Category: webinar?.organisedBy,
            FORM_NAME: `${webinar?.organisedBy} Landing page`,
            Lead_Status: "No Contact Initiated",
            Lead_Source: "Knotral Trainings",
            Webinar_Date_TIme: moment(
                `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
                "YYYY-MM-DD h:mm A"
            ).format("YYYY-MM-DDTHH:mm:ssZ"),
            webinarId: webinar?._id,

            // UTM fields
            utm_source: utms?.utm_source || "",
            utm_medium: utms?.utm_medium || "",
            utm_campaign: utms?.utm_campaign || "",
        };

        console.log("🚀 Webinar Registration Payload:", payload);

        return payload;
    };


    const submitRegistration = async (payload) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/zoho/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                return true;
            } else {
                alert("❌ Something went wrong. Try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("❌ Something went wrong. Try again.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();


        // ✅ Show alert if not agreed
        if (!agreed) {
            alert("Please agree to the Terms of Service and Privacy Policy before registering.");
            return;
        }

        // ✅ Prevent double submit
        if (isSubmitting) return;

        setIsSubmitting(true);

        // Free webinar
        if (webinar?.isFree) {
            const success = await submitRegistration(getSubmitPayload());
            if (success) {
                router.push(`/thank-you/${webinar.slug}`);
            }
            setIsSubmitting(false);
            return;
        }

        try {
            // Step A: Create payment order
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/create-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: webinar?.price,
                    currency: "INR",
                    webinarId: webinar?._id,
                    webinarTitle: webinar?.title,
                    category: webinar?.organisedBy,
                    userData: getSubmitPayload(),
                }),
            });

            const orderData = await orderRes.json();
            if (!orderData?.orderId) {
                setIsSubmitting(false);
                alert("Order creation failed");
                return;

            }

            // Step B: Open Razorpay checkout
            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: webinar.title,
                description: "Webinar Registration Payment",
                order_id: orderData.orderId,
                prefill: {
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    contact: `${user.countryCode.replace("+", "")}${user.mobileNumber}`,
                },
                notes: {
                    organisedBy: webinar.organisedBy,
                    webinarName: webinar.title,
                },
                handler: async function (response) {
                    // Step C: Verify payment
                    const verifyRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/verify-payment`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        }
                    );
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        // Step D: Submit form after successful payment
                        const success = await submitRegistration(getSubmitPayload());
                        if (success) {
                            router.push(`/thank-you/${webinar.slug}`);
                        }
                        // setShowModal(true);
                    } else {
                        alert("Payment verification failed. Try again.");
                    }
                },
                theme: { color: "#3399cc" },
            });

            rzp.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong during payment.");
        }
    };

    const handleGoogleConnect = () => {
        const redirect = window.location.href;

        window.location.href =
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/google/connect?userId=${user._id}&redirect=${encodeURIComponent(redirect)}`;
    };

    return (<div className={styles.overlay}> <div className={styles.modal}>

        <button className={styles.close} onClick={onClose}>
            ✕
        </button>

        <h2>Confirm Registration</h2>

        <div className={styles.webinarInfo}>
            <h3>{webinar.title}</h3>

            <p>
                <strong>Date:</strong>{" "}
                {moment(webinar.date).format("DD MMM YYYY")}
            </p>

            <p>
                <strong>Time:</strong> {webinar.startTime}
            </p>

            <p>
                <strong>Organised By:</strong> {webinar.organisedBy}
            </p>
        </div>

        <div className={styles.userInfo}>
            <h4>Your Details</h4>

            <div className={styles.field}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>
                    {user?.firstName} {user?.lastName}
                </span>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{user?.email}</span>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>Mobile:</span>
                <span className={styles.value}>
                    {user?.countryCode}
                    {user?.mobileNumber}
                </span>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>School/Organization:</span>
                <span className={styles.value}>
                    {user?.organizationName}
                </span>
            </div>


            <div className={styles.field}>
                <span className={styles.label}>Designation:</span>
                <span className={styles.value}>
                    {user?.roleDescription === "Other"
                        ? user?.otherDescription
                        : user?.roleDescription}
                </span>
            </div>
        </div>

        <div className={styles.agreement}>
            <label className={styles.agreementLabel}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    required
                />
                <span>
                    By registering, you agree to Knotral's{" "}
                    <a href="/terms-and-conditions" style={{ color: "var(--secondary-blue)" }}>
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <Link href="/privacy-policy" style={{ color: "var(--secondary-blue)" }}>
                        Privacy Policy
                    </Link>
                </span>
            </label>
        </div>
{/* 
        {user?.authType === "local" &&
            user?.email?.endsWith("@gmail.com") &&
            !user?.isCalendarConnected && (
                <button
                    className="btn btnsecondary btnblock"
                    onClick={handleGoogleConnect}
                    style={{ marginBottom: "16px" }}
                >
                    Connect Google Calendar
                </button>
            )} */}

        <button
            className="btn btnprimary btnlg btnblock"
            onClick={handleSubmit}
        // disabled={!agreed || isSubmitting}
        >
            {isSubmitting ? "Registering..." : "Confirm Registration"}
        </button>
    </div>
    </div>
    );
}

