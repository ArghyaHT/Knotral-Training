"use client";
import React, { useEffect, useState } from "react";
import styles from "./ZohoForms.module.css"
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import { useAuth } from "@/context/AuthContext";

export default function ZohoForm({ webinar, utms }) {

  const { user, logout } = useAuth();

  console.log("User in ZohoForm:", user); // Debugging line

  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);




  const isTilliKids = webinar?.organisedBy === "Tilli Kids";

  const isOnFire = webinar?.organisedBy === "Onfire";


  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const cleanTime = webinar.startTime.replace(" IST", "");

  // Form state
  const [formData, setFormData] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Mobile: "+91",
    City: "",
    Company: "",
    Designation: "",
    Grade: "",
    Student_Name: "",
    Student_Age: "",
    School_Board: "",
    Preferred_Program_Level: "",
    Region_To_Operate: "", // ✅ always exists, used only for Tilli Kids
    FORM_NAME: `${webinar?.organisedBy} Landing page`,
    Category: webinar?.organisedBy || "",
    Lead_Status: "No Contact Initiated",
    Lead_Source: "Knotral Trainings",
    Webinar_Date_TIme: moment(
      `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
      "YYYY-MM-DD h:mm A"
    ).format("YYYY-MM-DDTHH:mm:ssZ"),
    webinarId: webinar?._id,


    // ✅ UTM fields
    utm_source: utms?.utm_source || "",
    utm_medium: utms?.utm_medium || "",
    utm_campaign: utms?.utm_campaign || "",
  });

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        Email: user.email,
        Mobile: `${user.countryCode}${user.mobileNumber || ""}`
      }));
    }
  }, [user]);

  // Generic handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mobile handler
  const handleMobileChange = (e) => {
    let value = e.target.value;

    // Always enforce +91 prefix
    if (!value.startsWith("+91")) value = "+91";

    // Only digits after +91
    const digitsOnly = value.slice(3).replace(/\D/g, "");

    // Limit to 10 digits
    if (digitsOnly.length > 10) return;

    setFormData((prev) => ({
      ...prev,
      Mobile: "+91" + digitsOnly,
    }));
  };

  const handleKeyDown = (e) => {
    // Prevent deleting +91
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      e.target.selectionStart <= 3
    ) {
      e.preventDefault();
    }
  };

  // Generate payload for submission
  const getSubmitPayload = () => {
    if (isTilliKids) {
      return {
        First_Name: formData.First_Name,
        Last_Name: formData.Last_Name,
        Email: formData.Email,
        Mobile: formData.Mobile,
        Region_To_Operate: formData.Region_To_Operate,
        Category: webinar?.organisedBy,
        FORM_NAME: `${webinar?.organisedBy} Landing page`,
        Lead_Status: formData.Lead_Status,
        Lead_Source: formData.Lead_Source,
        Webinar_Date_TIme: moment(
          `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
          "YYYY-MM-DD h:mm A"
        ).format("YYYY-MM-DDTHH:mm:ssZ"),
        webinarId: webinar?._id,


        // ✅ UTM fields
        utm_source: utms?.utm_source || "",
        utm_medium: utms?.utm_medium || "",
        utm_campaign: utms?.utm_campaign || "",
      };
    }
    return formData;
  };

  // Form submission
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
          name: `${formData.First_Name} ${formData.Last_Name}`.trim(),
          email: formData.Email,
          contact: formData.Mobile,
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

  // Submit registration to Zoho
  const submitRegistration = async (payload) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/zoho/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        // Reset form
        setFormData(
          isTilliKids
            ? {
              First_Name: "",
              Last_Name: "",
              Email: "",
              Mobile: "+91",
              Region_To_Operate: "",
              Category: webinar?.organisedBy,
              FORM_NAME: `${webinar?.organisedBy} Landing page`,
              Lead_Status: "No Contact Initiated",
              Lead_Source: "Knotral Trainings",
              Webinar_Date_TIme: moment(
                `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
                "YYYY-MM-DD h:mm A"
              ).format("YYYY-MM-DDTHH:mm:ssZ"),

            }
            : {
              First_Name: "",
              Last_Name: "",
              Email: "",
              Mobile: "+91",
              Company: "",
              City: "",
              Designation: "",
              Category: webinar?.organisedBy,
              FORM_NAME: `${webinar?.organisedBy} Landing page`,
              Lead_Status: "No Contact Initiated",
              Lead_Source: "Knotral Trainings",
              Webinar_Date_TIme: moment(
                `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
                "YYYY-MM-DD h:mm A"
              ).format("YYYY-MM-DDTHH:mm:ssZ"),

            }
        );

        console.log("form Data", formData)

        return true;
        // setShowModal(true);
      } else {
        alert("❌ Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ Something went wrong. Try again.");
    }
  };

  return (
    <section className={styles.formpage}>
      <div className="container">
        <div className={styles.formcontainer}>
          <div className={styles.formcard}>
            <h2>
              {isOnFire
                ? "Register for the Open Day"
                : "Register for the Trainings"
              }
            </h2>
            <p className={styles.subheading}>
              {webinar.registerFormSubheading}
            </p>

            <form onSubmit={handleSubmit}>
              {
                // isOnFire ? (
                //   <>
                //     {/* On Fire Fields */}
                //     <div className={styles.formrow}>
                //       <div className={styles.formgroup}>
                //         <label>First Name <span className="required">*</span></label>
                //         <input
                //           type="text"
                //           name="First_Name"
                //           value={formData.First_Name}
                //           onChange={handleChange}
                //           placeholder="First name"
                //           required
                //         />
                //       </div>

                //       <div className={styles.formgroup}>
                //         <label>Last Name <span className="required">*</span></label>
                //         <input
                //           type="text"
                //           name="Last_Name"
                //           value={formData.Last_Name}
                //           onChange={handleChange}
                //           placeholder="Last name"
                //           required
                //         />
                //       </div>
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Email Address (for webinar link & reminders) <span className="required">*</span></label>
                //       <input
                //         type="email"
                //         name="Email"
                //         value={formData.Email}
                //         onChange={handleChange}
                //         placeholder="you@example.com"
                //         required
                //       />
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Mobile Number (WhatsApp enabled) <span className="required">*</span></label>
                //       <input
                //         type="tel"
                //         name="Mobile"
                //         value={formData.Mobile}
                //         onChange={handleMobileChange}
                //         onKeyDown={handleKeyDown}
                //       />
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>City & State <span className="required">*</span></label>
                //       <input
                //         type="text"
                //         name="City"
                //         value={formData.City}
                //         onChange={handleChange}
                //         placeholder="City, State"
                //         required
                //       />
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Student’s Name <span className="required">*</span></label>
                //       <input
                //         type="text"
                //         name="Student_Name"
                //         value={formData.Student_Name}
                //         onChange={handleChange}
                //         placeholder="Student's Name"
                //         required
                //       />
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Student’s Current Grade <span className="required">*</span></label>
                //       <select
                //         name="Grade"
                //         value={formData.Grade}
                //         onChange={handleChange}
                //         required
                //       >
                //         <option value="">Select grade</option>
                //         {["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(g => (
                //           <option key={g} value={g}>{g}</option>
                //         ))}
                //       </select>
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Student’s Age <span className="required">*</span></label>
                //       <input
                //         type="number"
                //         name="Student_Age"
                //         value={formData.Student_Age}
                //         onChange={handleChange}
                //         placeholder="Student's age"
                //         required
                //       />
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Current School Board <span className="required">*</span></label>
                //       <select
                //         name="School_Board"
                //         value={formData.School_Board}
                //         onChange={handleChange}
                //         required
                //       >
                //         <option value="">Select board</option>
                //         {["CBSE", "ICSE", "State Board", "IGCSE / IB", "Homeschooled", "Other"].map(b => (
                //           <option key={b} value={b}>{b}</option>
                //         ))}
                //       </select>
                //     </div>

                //     <div className={styles.formgroup}>
                //       <label>Preferred Program Level <span className="required">*</span></label>
                //       <select
                //         name="Preferred_Program_Level"
                //         value={formData.Preferred_Program_Level}
                //         onChange={handleChange}
                //         required
                //       >
                //         <option value="">Select program level</option>
                //         {["Elementary (KG–5)", "Middle School (6–8)", "High School (9–12)", "Not sure yet"].map(l => (
                //           <option key={l} value={l}>{l}</option>
                //         ))}
                //       </select>
                //     </div>
                //   </>
                // ) 
                // :
                isTilliKids ? (
                  <>
                    {/* Tilli Kids Fields */}
                    <div className={styles.formrow}>
                      <div className={styles.formgroup}>
                        <label>First Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="First_Name"
                          value={formData.First_Name}
                          onChange={handleChange}
                          placeholder="First name"
                          required
                        />
                      </div>

                      <div className={styles.formgroup}>
                        <label>Last Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="Last_Name"
                          value={formData.Last_Name}
                          onChange={handleChange}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formgroup}>
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        readOnly
                        className={styles.readonlyInput}
                      />
                    </div>

                    <div className={styles.formgroup}>
                      <label>WhatsApp Number <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="Mobile"
                        value={formData.Mobile}
                        onChange={handleMobileChange}
                        onKeyDown={handleKeyDown}
                        required
                        pattern="^\+91[0-9]{10}$"
                        title="Please enter a valid 10 digit WhatsApp number"
                      />
                    </div>

                    <div className={styles.formgroup}>
                      <label>Region you operate in <span className="required">*</span></label>
                      <input
                        type="text"
                        name="Region_To_Operate"
                        value={formData.Region_To_Operate}
                        onChange={handleChange}
                        placeholder="Your region"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Default Non-Tilli Fields */}
                    <div className={styles.formrow}>
                      <div className={styles.formgroup}>
                        <label>First Name <span className="required">*</span></label>
                        <input type="text" name="First_Name" onChange={handleChange} placeholder="Enter first name" required />
                      </div>

                      <div className={styles.formgroup}>
                        <label>Last Name <span className="required">*</span></label>
                        <input type="text" name="Last_Name" onChange={handleChange} placeholder="Enter last name" required />
                      </div>
                    </div>

                    <div className={styles.formgroup}>
                      <label>Email Address <span className="required">*</span></label>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        readOnly
                        className={styles.readonlyInput}
                      />
                    </div>

                    <div className={styles.formgroup}>
                      <label>WhatsApp Number <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="Mobile"
                        value={formData.Mobile}
                        onChange={handleMobileChange}
                        onKeyDown={handleKeyDown}
                        required
                        pattern="^\+91[0-9]{10}$"
                        title="Please enter a valid 10 digit WhatsApp number"
                      />
                    </div>

                    <div className={styles.formgroup}>
                      <label>School/Organization Name <span className="required">*</span></label>
                      <input type="text" name="Company" onChange={handleChange} placeholder="Your school or organization" />
                    </div>

                    <div className={styles.formrow}>
                      <div className={styles.formgroup}>
                        <label>Your Designation <span className="required">*</span></label>
                        <select name="Designation" onChange={handleChange} required>
                          <option value="">Select your designation...</option>
                          <option>Teacher</option>
                          <option>Academic Coordinator</option>
                          <option>Head of Department</option>
                          <option>Vice Principal</option>
                          <option>Principal</option>
                          <option>Curriculum Head</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className={styles.formgroup}>
                        <label>City <span className="required">*</span></label>
                        <input type="text" name="City" onChange={handleChange} placeholder="Your city" />
                      </div>
                    </div>
                  </>
                )}

              <div className={styles.formdivider}></div>


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

              <button
                className="btn btnprimary btnlg btnblock"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Registration"}
              </button>
            </form>

          </div>
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2>🎉 Thank You!</h2>
            <p>Your registration was successful. We’ll contact you soon!</p>

            <button
              className={styles.modalButton}
              onClick={() => {
                setShowModal(false);
                router.push("/"); // 👉 redirect to homepage
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
