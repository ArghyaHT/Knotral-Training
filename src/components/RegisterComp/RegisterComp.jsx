"use client";

import React, { useEffect, useState } from "react";
import styles from "./Register.module.css"
import Link from "next/link";
import moment from "moment";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import LoginModal from "../LoginModal/LoginModal";
import { IoCheckmark } from "react-icons/io5";

const RegisterComp = ({ webinar, utms }) => {


  const [activeVideo, setActiveVideo] = useState(null);

  const [activeTab, setActiveTab] = useState("teachers-content");

  const [certificate, setCertificate] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [registeredWebinars, setRegisteredWebinars] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);


  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLoginModal]);


  useEffect(() => {
    if (showRegisterModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showRegisterModal]);


  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        if (!webinar?._id) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/certificates/get-webinar-certificate?webinarId=${webinar._id}`
        );

        const data = await response.json();

        if (data.success) {
          setCertificate(data.response);   // ✅ store full object
        }
      } catch (error) {
        console.error("Failed to fetch certificate:", error);
      }
    };

    if (webinar?.isCertified) {
      fetchCertificate();
    }
  }, [webinar]);


  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-user-registered-webinars`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: user.email
            })
          }
        );

        const data = await res.json();

        // ✅ Console the full response
        console.log("Registered Webinar API Response:", data);

        if (data.success) {
          console.log("Registered Webinars:", data.response); // ✅ only webinars
          setRegisteredWebinars(data.response);
        }

      } catch (error) {
        console.error("Error fetching registered webinars:", error);
      }
    };

    if (user?.email) {
      fetchRegistered();
    }

  }, [user]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const playRecording = (session) => {
    setActiveVideo(session);
  };

  const closeVideoPlayer = () => {
    setActiveVideo(null);
  };

  const shareVideo = async () => {
    if (!activeVideo) return;
    const url = `https://youtu.be/${activeVideo.youtubeId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeVideo.title || webinar.title,
          url,
        });
      } catch (err) {
        // User cancelled share → ignore
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  const cleanTime = webinar?.startTime?.replace(" IST", "") || "";

  const handleRegister = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      First_Name: user?.firstName || "",
      Last_Name: user?.lastName || "",
      Email: user?.email || "",
      Mobile: `${user?.countryCode || ""}${user?.mobileNumber || ""}`,
      Category: webinar?.organisedBy || "",
      FORM_NAME: `${webinar?.organisedBy || ""} Landing page`,
      Lead_Status: "No Contact Initiated",
      Lead_Source: "Knotral Trainings",
      Webinar_Date_TIme: webinar?.date ? moment(
        `${moment(webinar.date).format("YYYY-MM-DD")} ${cleanTime}`,
        "YYYY-MM-DD h:mm A"
      ).format("YYYY-MM-DDTHH:mm:ssZ") : "",
      webinarId: webinar?._id,

      // UTM fields
      utm_source: utms?.utm_source || "",
      utm_medium: utms?.utm_medium || "",
      utm_campaign: utms?.utm_campaign || "",
    };

    const submitRegistration = async (submitPayload) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/zoho/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitPayload),
        });

        const data = await res.json();
        return data.success;
      } catch (error) {
        console.error("Registration error:", error);
        alert("❌ Something went wrong. Try again.");
        return false;
      }
    };

    if (webinar?.isFree) {
      const success = await submitRegistration(payload);
      if (success) {
        router.push(`/thank-you/${webinar.slug}`);
      } else {
        alert("❌ Something went wrong. Try again.");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: webinar?.price,
          currency: "INR",
          webinarId: webinar?._id,
          webinarTitle: webinar?.title,
          category: webinar?.organisedBy,
          userData: payload,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData?.orderId) {
        setIsSubmitting(false);
        alert("Order creation failed");
        return;
      }

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
            const success = await submitRegistration(payload);
            if (success) {
              router.push(`/thank-you/${webinar.slug}`);
            }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // useEffect(() => {
  //   if (activeVideo) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }

  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [activeVideo]);

  useEffect(() => {
  if (showLoginModal || activeVideo) {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  return () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };
}, [showLoginModal, activeVideo]);

  const isJanuaryWebinar = moment(webinar?.date).month() === 0; // January = 0

  // Determine button text and style based on webinar actions
  const buttonText = webinar?.actions?.canStartProgram
    ? "Start Course"
    : webinar?.actions?.canEnroll
      ? "Watch Now"
      : "Register Now";

  const buttonClass = webinar?.actions?.canStartProgram || webinar?.actions?.canEnroll
    ? "btn btnsecondary btnblock"
    : "btn btnprimary btnblock";

  const href =
    webinar?.actions?.canStartProgram || webinar?.actions?.canEnroll
      ? `/course/${webinar?.slug}`
      : `/register/${webinar?.slug}`;


  const hasPastSessions = Boolean(
    webinar?.pastSessions && webinar.pastSessions.length > 0
  );

  // console.log("Registered Webinars in Component:", registeredWebinars); // ✅ log registered webinars
  // console.log("Current Webinar ID:", webinar?._id, webinar?.date); // ✅ log current webinar ID

  const isRegistered = (registeredWebinars || []).some(r => {
    const sameWebinar = String(r.webinarId) === String(webinar?._id);

    const regDate = new Date(r.webinarDate).toISOString().split("T")[0];
    const webinarDate = new Date(webinar?.date).toISOString().split("T")[0];

    const sameDate = regDate === webinarDate;

    return sameWebinar && sameDate;
  });

  return (
    <section className={styles.landingcontent}>
      <div className="container">
        <div className={styles.landinggrid}>
          {/* Main Content */}
          <div className={styles.maincontent}>
            <div className={styles.spbadge}>
              <Link
                href={webinar?.link || "/"}
                target={webinar?.link ? "_blank" : "_self"}
                rel={webinar?.link ? "noopener noreferrer" : undefined}
                className={styles.productlink}
              >
                <div
                  className={styles.logo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    color: "var(--secondary-blue)",
                  }}
                >
                  <img
                    src={webinar?.logo?.url}
                    alt="Logo"
                    style={{ width: "65px", height: "65px" }}
                  />
                </div>
              </Link>
              {webinar?.isLive && (
                <span className="badge badgelive">LIVE WEBINAR</span>
              )}

              {webinar?.isCertified && (
                <span className="badge badgecert">Participation Certificate Included</span>
              )}

            </div>

            <h1>
              {webinar?.title}
            </h1>
            <p className={styles.description}>
              {webinar?.description}
            </p>

            <div className={styles.contentsection}>
              <h2>What You'll Learn</h2>
              {webinar.organisedBy === "We Skoolhouse" ? (
                <section className={styles.learningSection}>
                  <div className={styles.cardGrid}>
                    <div className={styles.card}>
                      <div className={`${styles.imagePlaceholder} ${styles.bgTan}`}>
                        <img src="/weShoolHouse1.jpg" alt="Reggio Emilia History" />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>History of the Reggio Emilia Approach</h3>
                        <p>Explore the origins and evolution of this groundbreaking philosophy.</p>
                      </div>
                    </div>

                    <div className={styles.card}>
                      <div className={styles.imagePlaceholder}>
                        <img src="/weShoolHouse2.jpg" alt="Child portrait" />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>The Image of the Child</h3>
                        <p>Reframe how you view children as capable, curious, and full of potential.</p>
                      </div>
                    </div>

                    <div className={styles.card}>
                      <div className={styles.imagePlaceholder}>
                        <img src="/weShoolHouse3.jpg" alt="Classroom environment" />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>The Environment as the Third Teacher</h3>
                        <p>Learn how thoughtful, responsive spaces can shape learning and behavior.</p>
                      </div>
                    </div>

                    <div className={styles.card}>
                      <div className={`${styles.imagePlaceholder} ${styles.bgDark}`}>
                        <img src="/weShoolHouse4.jpg" alt="Documentation and Advocacy" />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>Documentation</h3>
                        <p>Discover powerful tools to observe, reflect, and make learning visible.</p>
                      </div>
                    </div>

                    <div className={styles.card}>
                      <div className={styles.imagePlaceholder}>
                        <img src="/weShoolHouse5.jpg" alt="Teachers collaborating" />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>Community and Collaboration</h3>
                        <p>Understand how relationships among children, families, and educators form the heart of this approach.</p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <ul>
                  {webinar.features.map((item) => (
                    <li key={item._id}>{item.feature}</li>
                  ))}
                </ul>
              )}
            </div>

            {isJanuaryWebinar ? (

              <div className={styles.contentsection}>
                <h2>Who Should Attend</h2>
                <div className={styles.audiencegrid}>
                  {webinar?.whoCanAttend && webinar?.whoCanAttend.map((audience) => {
                    // Map keys to image URLs
                    const audienceIcons = {
                      teachers: "/attend1.png",
                      counsellors: "/attend2.png",
                      tuition_owners: "/attend3.png",
                      coaching_owners: "/attend4.png",
                      consultants: "/attend5.png",
                      leaders: "/attend6.png",
                      heads: "/attend7.png",
                    };

                    return (
                      <div className={styles.audienceitem} key={audience._id}>
                        <div className={styles.icon}>
                          <img
                            src={audienceIcons[audience.key] || "/icons/default.png"}
                            alt={audience.title}
                            className={styles.audienceIcon}
                          />
                        </div>
                        <div className={styles.label}>
                          {audience.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.audiencetabs}>
                  <div
                    className={`${styles.audiencetab} ${activeTab === "teachers-content" ? styles.active : ""
                      }`}
                    onClick={() => handleTabClick("teachers-content")}
                  >
                    <img
                      src="/attend1.png"
                      alt="Teachers"
                      className={styles.tabicon}
                    />
                    For Teachers
                  </div>

                  <div
                    className={`${styles.audiencetab} ${activeTab === "schools-content" ? styles.active : ""
                      }`}
                    onClick={() => handleTabClick("schools-content")}
                  >
                    <img
                      src="/attend6.png"
                      alt="Schools"
                      className={styles.tabicon}
                    />
                    For Schools
                  </div>

                  <div
                    className={`${styles.audiencetab} ${activeTab === "resellers-content" ? styles.active : ""
                      }`}
                    onClick={() => handleTabClick("resellers-content")}
                  >
                    <img
                      src="/attend5.png"
                      alt="Partners"
                      className={styles.tabicon}
                    />
                    For Partners
                  </div>
                </div>

                <div
                  id="teachers-content"
                  className={`${styles.tabcontent} ${activeTab === "teachers-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>What You'll Learn</h2>

                    <ul className={styles.learninglist}>
                      {/* <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          What "student engagement" really looks like inside your classroom
                          
                        </span>
                      </li> */}

                      {webinar?.teachersBenifits?.features?.map((item, index) => (
                        <li key={index} className={styles.learningitem}>
                          <span className={styles.learningtext}>
                            {item}
                          </span>
                        </li>
                      ))}


                    </ul>
                  </div>

                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>Why Attend as a Teacher</h2>

                    <div className={styles.whyattendgrid}>
                      <div className={styles.whycard}>
                        <div className={styles.whyicon}>
                          <img
                            src="/attend1.png"
                            alt="Why attend 1"
                            className={styles.whyiconImage}
                          />
                        </div>
                        <p className={styles.whydescription}>
                          {webinar?.teachersBenifits?.whyNeeded?.[0]}
                        </p>
                      </div>

                      <div className={styles.whycard}>
                        <div className={styles.whyicon}>
                          <img
                            src="/attend4.png"
                            alt="Why attend 2"
                            className={styles.whyiconImage}
                          />
                        </div>
                        <p className={styles.whydescription}>
                          {webinar?.teachersBenifits?.whyNeeded?.[1]}
                        </p>
                      </div>

                      <div className={styles.whycard}>
                        <div className={styles.whyicon}>
                          <img
                            src="/attend7.png"
                            alt="Why attend 3"
                            className={styles.whyiconImage}
                          />
                        </div>
                        <p className={styles.whydescription}>
                          {webinar?.teachersBenifits?.whyNeeded?.[2]}
                        </p>
                      </div>

                      {/* <div className={styles.whycard}>
                        <div className={styles.whyicon}>
                          <img
                            src="/attend5.png"
                            alt="Why attend 4"
                            className={styles.whyiconImage}
                          />
                        </div>
                        <p className={styles.whydescription}>
                          {webinar?.teachersBenifits?.whyNeeded?.[3]}
                        </p>
                      </div> */}
                    </div>

                  </div>
                </div>


                <div
                  id="schools-content"
                  className={`${styles.tabcontent} ${activeTab === "schools-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>Benefits for Your School</h2>

                    <div className={styles.benefitsgrid}>
                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend1.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Teacher Development</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Upskill your entire teaching staff with evidence-based practices that improve student outcomes and teacher retention. */}
                          {webinar?.schoolBenifits?.features?.[0]}
                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend6.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Measurable Results</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Track improvement in student engagement through classroom observations and data-driven insights. */}
                          {webinar?.schoolBenifits?.features?.[1]}

                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend5.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>School-Wide Impact</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Create a culture of reflective practice that elevates teaching quality across all departments. */}
                          {webinar?.schoolBenifits?.features?.[2]}
                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend3.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Ongoing Support</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Access to resources, follow-up sessions, and implementation support for sustainable change. */}
                          {webinar?.schoolBenifits?.features?.[3]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>


                <div
                  id="resellers-content"
                  className={`${styles.tabcontent} ${activeTab === "resellers-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>Partner Opportunities</h2>

                    <div className={styles.benefitsgrid}>
                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend5.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Lead Generation</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Connect with schools actively seeking professional development solutions and teacher training programs. */}
                          {webinar?.resellerBenifits?.features?.[0]}

                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend1.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Product Knowledge</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Deep-dive into solution features, implementation strategies, and ROI to better serve your clients. */}
                          {webinar?.resellerBenifits?.features?.[1]}

                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend7.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Sales Enablement</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Gain presentation materials, case studies, and demo access to accelerate your sales cycle. */}
                          {webinar?.resellerBenifits?.features?.[2]}

                        </p>
                      </div>

                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend2.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        {/* <h3 className={styles.benefittitle}>Partnership Support</h3> */}
                        <p className={styles.benefitdescription}>
                          {/* Direct access to provider representatives for co-selling opportunities and client support. */}
                          {webinar?.resellerBenifits?.features?.[3]}

                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}


            <div className={styles.contentsection}>
              {webinar?.trainer[0] && (
                <>
                  <h2>Meet Your Trainer</h2>
                  <div className={styles.trainers}>
                    {webinar?.trainer && webinar?.trainer.map((t, index) => (
                      <div className={styles.trainercard} key={index}>
                        <div className={styles.photo}>
                          <img
                            src={t.trainerImage?.url || "/defaultImage.webp"}
                            alt={t.trainerName || "Trainer"}
                          />
                        </div>
                        <div>
                          <h3>{t.trainerName}</h3>
                          <div className={styles.title}>
                            {t.designation}{t.worksAt ? `, ${t.worksAt}` : ""}
                          </div>
                          <p>{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={styles.contentsection}>
              <h2>Session Agenda</h2>
              <div className={styles.agendalist}>
                {webinar?.sessionAgenda?.map((item) => (
                  <div key={item._id} className={styles.agendaitem}>
                    <div className={styles.time}>{item.time}</div>
                    <div className={styles.topic}>{item.title}</div>
                  </div>
                ))}
              </div>
            </div>


            <div className={styles.contentsection}>
              <h2>Exclusive Attendee Benefits</h2>

              {webinar?.isCertified && certificate?.certificateFile?.url && (
                <div className={styles.certificateWrapper}>
                  <img
                    src={certificate.sampleCertificateFile.url}
                    alt="Sample Certificate"
                    className={styles.certificateImage}
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}
              <div className={styles.benefitbox}>
                <h3>{webinar?.attendeeBenefits?.title}</h3>
                {/* <p style={{ marginBottom: "16px", opacity: 0.9 }}>
                  30-Day Free Trial of {webinar.organisedBy}
                </p> */}
                <ul>
                  {webinar?.attendeeBenefits?.features?.map((feature, index) => (
                    <li key={index} className={styles.benefits}>{feature}</li>
                  ))}
                </ul>
                <Link href={webinar?.link || "/"}
                  target={webinar?.link ? "_blank" : "_self"}
                  rel={webinar?.link ? "noopener noreferrer" : undefined} className={styles.productlink}>
                  Learn More About {webinar?.organisedBy} →
                </Link>
              </div>
            </div>


            {/* 🟢 SHOW PAST SESSIONS ONLY WHEN WEBINAR IS STOPPED */}
            {!webinar?.isStopped && hasPastSessions && (
              <>
                <div className={styles.pastsessionssection}>
                  <div className={styles.pastsessionsheader}>
                    <h2 className={styles.pastsessionstitle}>Past Sessions</h2>
                  </div>

                  <div className={styles.pastrecordingsgrid}>
                    {webinar?.pastSessions?.map((session) => (
                      <div
                        key={session._id}
                        className={styles.recordingcard}
                        onClick={() => playRecording(session)}
                      >
                        <div className={styles.recordingthumbnail}>
                          <img
                            src={`https://img.youtube.com/vi/${session.youtubeId}/maxresdefault.jpg`}
                            alt={session.title}
                          />
                          <div className={styles.playoverlay}>▶</div>
                        </div>

                        <div className={styles.recordinginfo}>
                          <div className={styles.recordingdate}>
                            {moment(session.date).format("D MMMM")}
                          </div>
                          <div className={styles.recordingtitle}>
                            {session.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activeVideo && (
                  <div
                    className={styles.videooverlay}
                    onClick={closeVideoPlayer}
                  >
                    <div
                      className={styles.videoplayersection}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.videoplayerheader}>
                        <button
                          className={styles.backbtn}
                          onClick={closeVideoPlayer}
                        >
                          ← Back to All Sessions
                        </button>
                        <span>{moment(activeVideo.date).format("D MMMM")}</span>
                      </div>

                      <div className={styles.videocontainer}>
                        <iframe
                          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                          title={activeVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      <div className={styles.videometa}>
                        <div className={styles.videoactions}>
                          <button className={styles.actionbtn} onClick={shareVideo}>
                            🔗 Share
                          </button>
                          <button className={styles.actionbtn}>📥 Download Resources</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* 🔴 ACTIVE WEBINAR → Show Registration */}
          {!webinar?.isStopped && (
            <div className={styles.registrationcard}>
              <div className={styles.regmeta}>
                <div className={styles.item}>
                  <img src="/form2.png" alt="date" className={styles.icon} />
                  {moment(webinar?.date).format("MMM DD, YYYY")}
                </div>
                <div className={styles.item}>
                  <img src="/form1.png" alt="start time" className={styles.icon} />
                  {webinar?.startTime}
                </div>
                <div className={styles.item}>
                  <img src="/form3.png" alt="duration" className={styles.icon} />
                  {webinar?.duration}
                </div>
                <div className={styles.item}>
                  <img src="/form4.png" alt="mode" className={styles.icon} />
                  {webinar?.mode}
                </div>
              </div>

              <div className={styles.regdivider}></div>

              <div className={`${styles.regprice} ${webinar?.isFree ? styles.free : ""}`}>
                {webinar?.isFree ? "FREE" : `₹${webinar?.price}`}
              </div>

              {/* <Link href={href} className={buttonClass}>
                {buttonText}
              </Link> */}

              {!user ? (
                <button
                  className={buttonClass}
                  onClick={() => setShowLoginModal(true)}
                >
                  {buttonText}
                </button>
              ) : isRegistered ? (
                <button
                  className={`${buttonClass} btndisabled`}
                  disabled
                >
                  <IoCheckmark style={{ marginRight: "6px" }} />
                  Registered
                </button>
              ) : (
                <button
                  className={buttonClass}
                  onClick={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : buttonText}
                </button>
              )}


              {webinar?.bonus?.title && (
                <div className={styles.regbonus}>
                  <div className={styles.label}>BONUS</div>
                  <p>{webinar?.bonus?.title}</p>
                  <p>{webinar?.bonus?.description || ""}</p>
                </div>
              )}

              <div className={styles.regdivider}></div>

              <div className={styles.regfooter}>
                <p className={styles.metaInfo}>
                  <img src="/form5.png" alt="registered" className={styles.iconSmall} />
                  {webinar?.views} registered{" "}
                  <img src="/form6.png" alt="limited seats" className={styles.iconSmall} />
                  Limited seats
                </p>
              </div>
            </div>
          )}

          {/* 🟢 STOPPED WEBINAR → Show Past Sessions */}
          {webinar?.isStopped && hasPastSessions && (
            <>
              <div className={styles.registrationcard}>
                <div className={styles.pastsessionsheader}>
                  <h2 className={styles.pastsessionstitle}>Past Sessions</h2>
                </div>

                <div className={styles.pastrecordingsgrid1}>
                  {webinar.pastSessions.map((session) => (
                    <div
                      key={session._id}
                      className={styles.recordingcard}
                      onClick={() => playRecording(session)}
                    >
                      <div className={styles.recordingthumbnail}>
                        <img
                          src={`https://img.youtube.com/vi/${session.youtubeId}/maxresdefault.jpg`}
                          alt={session.title}
                        />
                        <div className={styles.playoverlay}>▶</div>
                      </div>

                      <div className={styles.recordinginfo}>
                        <div className={styles.recordingdate}>
                          {moment(session.date).format("D MMMM")}
                        </div>
                        <div className={styles.recordingtitle}>
                          {session.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeVideo && (
                <div className={styles.videooverlay} onClick={closeVideoPlayer}>
                  <div
                    className={styles.videoplayersection}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.videoplayerheader}>
                      <button className={styles.backbtn} onClick={closeVideoPlayer}>
                        ← Back to All Sessions
                      </button>
                      <span>{moment(activeVideo.date).format("D MMMM")}</span>
                    </div>

                    <div className={styles.videocontainer}>
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                        title={activeVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className={styles.videometa}>
                      <div className={styles.videoactions}>
                        <button className={styles.actionbtn} onClick={shareVideo}>
                          🔗 Share
                        </button>
                        <button className={styles.actionbtn}>
                          📥 Download Resources
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


        </div>
      </div>

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
        }}
      />
    </section>
  );
};

export default RegisterComp;
