"use client";

import React, { useEffect, useState } from "react";
import styles from "./Register.module.css"
import Link from "next/link";
import moment from "moment";
import ZohoForm2 from "../ZohoForm2/ZohoForm2";
import { IoClose } from "react-icons/io5";

const RegisterComp3 = ({ webinar, utms }) => {

  const [activeVideo, setActiveVideo] = useState(null);

  const [activeTab, setActiveTab] = useState("parents-content");

  const [certificate, setCertificate] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const isSkoolhouse = webinar.organisedBy === "We Skoolhouse";

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

    if (webinar.isCertified) {
      fetchCertificate();
    }
  }, [webinar]);

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
    if (showModal || activeVideo) {
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
  }, [showModal, activeVideo]);

  const isJanuaryWebinar = moment(webinar?.date).month() === 0; // January = 0

  // Determine button text and style based on webinar actions
  const buttonText =
    webinar.organisedBy === "We Skoolhouse"
      ? "Pay and Register"
      : webinar.actions?.canStartProgram
        ? "Start Course"
        : webinar.actions?.canEnroll
          ? "Watch Now"
          : "Register Now";

  const buttonClass = webinar.actions?.canStartProgram || webinar.actions?.canEnroll
    ? "btn btnsecondary btnblock"
    : "btn btnprimary btnblock";

  const href =
    webinar.actions?.canStartProgram || webinar.actions?.canEnroll
      ? `/course/${webinar.slug}`
      : `/register/${webinar.slug}`;


  const hasPastSessions = Boolean(
    webinar?.pastSessions && webinar.pastSessions.length > 0
  );

  return (
    <section className={styles.landingcontent}>
      <div className="container">
        <div className={styles.landinggrid}>
          {/* Main Content */}
          <div className={styles.maincontent}>
            <div className={styles.spbadge}>
              <Link
                href={webinar.link || "/"}
                target={webinar.link ? "_blank" : "_self"}
                rel={webinar.link ? "noopener noreferrer" : undefined}
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
                    src={webinar.logo.url}
                    alt="Logo"
                    style={{ width: "65px", height: "65px" }}
                  />
                </div>
              </Link>
              {webinar.isLive && (
                <span className="badge badgelive">LIVE WEBINAR</span>
              )}

              {webinar.isCertified && (
                <span className="badge badgecert">Participation Certificate Included</span>
              )}

            </div>

            <h1>
              {webinar.title}
            </h1>

            <h2 className={styles.subheading}>Can Students Prepare for International University Pathways Without Leaving Their Current School?</h2>

            {/* <p className={styles.description}>
              {webinar.description}
            </p> */}

            <p
              className={styles.description}
              style={{ whiteSpace: "pre-line" }}
            >
              {webinar.description}
            </p>

            <div className={styles.contentsection}>
              <h2>Why This Webinar Matters</h2>
              {/* <ul>
                {webinar.features.map((item) => (
                  <li key={item._id}>{item.feature}</li>
                ))}
              </ul> */}
              <div className={styles.whyThisWebinarMatters}>
                <p>The education landscape is changing.</p>

                <p>
                  Universities across the world increasingly evaluate more than examination
                  scores.
                </p>

                <p>They look for students who can:</p>

                <ul>
                  <li>Think independently</li>
                  <li>Demonstrate academic depth</li>
                  <li>Adapt to new learning environments</li>
                  <li>Communicate effectively</li>
                  <li>Take ownership of their learning</li>
                </ul>

                <p>The question is no longer:</p>

                <p className={styles.highlight}>
                  "Which university should my child apply to?"
                </p>

                <p>The more important question is:</p>

                <p className={styles.highlight}>
                  "Is my child developing the skills and academic profile those universities
                  expect?"
                </p>
              </div>
            </div>


            {isJanuaryWebinar ? (

              <div className={styles.contentsection}>
                <h2>Who Should Attend</h2>
                <div className={styles.audiencegrid}>
                  {webinar.whoCanAttend && webinar.whoCanAttend.map((audience) => {
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
                    className={`${styles.audiencetab} ${activeTab === "parents-content" ? styles.active : ""
                      }`}
                    onClick={() => handleTabClick("parents-content")}
                  >
                    <img
                      src="/attend1.png"
                      alt="Parents"
                      className={styles.tabicon}
                    />
                    For Parents
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
                    className={`${styles.audiencetab} ${activeTab === "education-consultants-content" ? styles.active : ""
                      }`}
                    onClick={() => handleTabClick("education-consultants-content")}
                  >
                    <img
                      src="/attend5.png"
                      alt="Partners"
                      className={styles.tabicon}
                    />
                    For Education Consultants
                  </div>
                </div>

                <div
                  id="parents-content"
                  className={`${styles.tabcontent} ${activeTab === "parents-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>If your child is:</h2>
                    <ul>
                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Exploring international university opportunities
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Interested in studying abroad in the future
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Looking for academic exposure beyond traditional schooling
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Curious about UK curriculum pathways
                        </span>
                      </li>
                    </ul>
                    <p className={styles.tabDescription}>This session will help you understand how global academic readiness is built over time.</p>
                  </div>
                </div>


                <div
                  id="schools-content"
                  className={`${styles.tabcontent} ${activeTab === "schools-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    <h2 className={styles.sectiontitle}>If your institution is:</h2>

                    <ul>
                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Supporting globally aspiring students
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Responding to growing parent demand for international opportunities
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Exploring ways to expand student pathways
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Looking to stay ahead of education trends
                        </span>
                      </li>
                    </ul>
                    <p className={styles.tabDescription}>This webinar will provide valuable insights into emerging global education models.</p>

                  </div>
                </div>


                <div
                  id="education-consultants-content"
                  className={`${styles.tabcontent} ${activeTab === "education-consultants-content" ? styles.active : ""
                    }`}
                >
                  <div className={styles.contentsection}>
                    {/* <h2 className={styles.sectiontitle}>If you advise students and families on academic pathways, university admissions, or international opportunities, this session will help you understand:</h2> */}
                    <p className={styles.tabDescription}>If you advise students and families on academic pathways, university admissions, or international opportunities, this session will help you understand:</p>
                    <ul>
                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          International curriculum pathways
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Academic progression planning
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Global university preparation
                        </span>
                      </li>

                      <li className={styles.learningitem}>
                        <span className={styles.learningtext}>
                          Flexible models available for Indian students
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div className={styles.contentsection}>
              <h2>What You'll Learn</h2>
              {/* <ul>
                {webinar.features.map((item) => (
                  <li key={item._id}>{item.feature}</li>
                ))}
              </ul> */}
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

            <div className={styles.contentsection}>
              {webinar.trainer[0] && (
                <>
                  <h2>Meet Your Trainer</h2>
                  <div className={styles.trainers}>
                    {webinar.trainer && webinar.trainer.map((t, index) => (
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

            {/* <div className={styles.contentsection}>
              <h2>Session Agenda</h2>
              <div className={styles.agendalist}>
                {webinar?.sessionAgenda?.map((item) => (
                  <div key={item._id} className={styles.agendaitem}>
                    <div className={styles.time}>{item.time}</div>
                    <div className={styles.topic}>{item.title}</div>
                  </div>
                ))}
              </div>
            </div> */}

            <div className={styles.contentsection}>
              <h2>About Minerva Virtual Academy</h2>

              <p
                className={styles.description}
                style={{ whiteSpace: "pre-line" }}
              >
                Minerva Virtual Academy (MVA) is a UK-based online school helping students access internationally recognised learning pathways from anywhere in the world.
              </p>

              <h2 className={styles.sectiontitle}>Global Credentials</h2>
              <ul>
                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    UK Department for Education Registered School (URN 150780)
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Member: COBIS & BSME
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Global university preparation
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Pearson Edexcel & Cambridge Aligned
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Students from 60+ Countries
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    UK-Trained Faculty Network
                  </span>
                </li>
              </ul>
            </div>

            <div className={styles.contentsection}>
              <h2>What makes this session different?</h2>

              <p
                className={styles.description}
                style={{ whiteSpace: "pre-line" }}
              >
                This is not a sales presentation.
              </p>

              <p
                className={styles.description}
                style={{ whiteSpace: "pre-line" }}
              >
                It is a practical discussion designed to help families, schools, and education professionals understand:
              </p>

              <ul>
                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Global academic readiness

                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    International curriculum pathways

                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Student development strategies
                  </span>
                </li>

                <li className={styles.learningitem}>
                  <span className={styles.learningtext}>
                    Future university preparation
                  </span>
                </li>
              </ul>
              <p className={styles.tabDescription}>Whether or not you choose an international pathway later, the insights shared in this session will help you make more informed educational decisions.</p>

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
                <h3>{webinar.attendeeBenefits.title}</h3>
                {/* <p style={{ marginBottom: "16px", opacity: 0.9 }}>
                  30-Day Free Trial of {webinar.organisedBy}
                </p> */}
                <ul>
                  {webinar.attendeeBenefits?.features?.map((feature, index) => (
                    <li key={index} className={styles.benefits}>{feature}</li>
                  ))}
                </ul>
                <Link href={webinar.link || "/"}
                  target={webinar.link ? "_blank" : "_self"}
                  rel={webinar.link ? "noopener noreferrer" : undefined} className={styles.productlink}>
                  Learn More About {webinar.organisedBy} →
                </Link>
              </div>
            </div>


            {/* 🟢 SHOW PAST SESSIONS ONLY WHEN WEBINAR IS STOPPED */}
            {!webinar.isStopped && hasPastSessions && (
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
          {!webinar.isStopped && (
            <div className={styles.registrationcard}>
              <div className={styles.regmeta}>
                <div className={styles.item}>
                  <img src="/form2.png" alt="date" className={styles.icon} />
                  {moment(webinar.date).format("MMM DD, YYYY")}
                </div>
                <div className={styles.item}>
                  <img src="/form1.png" alt="start time" className={styles.icon} />
                  {webinar.startTime}
                </div>
                <div className={styles.item}>
                  <img src="/form3.png" alt="duration" className={styles.icon} />
                  {webinar.duration}
                </div>
                <div className={styles.item}>
                  <img src="/form4.png" alt="mode" className={styles.icon} />
                  {webinar.mode}
                </div>
              </div>

              <div className={styles.regdivider}></div>

              <div className={`${styles.regprice} ${webinar.isFree ? styles.free : ""}`}>
                {webinar.isFree ? (
                  "FREE"
                ) : webinar.organisedBy === "We Skoolhouse" ? (
                  <>
                    {/* <span className={styles.originalPrice}>₹4774</span>{" "} */}
                    <span className={styles.discountedPrice}>₹{webinar.price}</span>
                  </>
                ) : (
                  `₹${webinar.price}`
                )}
              </div>

              {isSkoolhouse ? (
                <button
                  className={buttonClass}
                  onClick={() => setShowModal(true)}
                >
                  {buttonText}
                </button>
              ) : (
                <Link href={href} className={buttonClass}>
                  {buttonText}
                </Link>
              )}

              {webinar.bonus?.title && (
                <div className={styles.regbonus}>
                  <div className={styles.label}>
                    {webinar.organisedBy === "We Skoolhouse"
                      ? "Limited Time Offer"
                      : "Bonus"}
                  </div>
                  <p>{webinar.bonus.title}</p>
                  <p>{webinar.bonus.description || ""}</p>
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
          {webinar.isStopped && hasPastSessions && (
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

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>

            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              <IoClose size={26} />
            </button>

            <ZohoForm2 webinar={webinar} utms={utms} />

          </div>
        </div>
      )}
    </section>
  );
};

export default RegisterComp3;
