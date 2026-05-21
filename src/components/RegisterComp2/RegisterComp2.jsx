"use client";

import React, { useEffect, useState } from "react";
import styles from "./RegisterComp2.module.css"
import Link from "next/link";
import moment from "moment";

const RegisterComp2 = ({ webinar }) => {

    const [activeVideo, setActiveVideo] = useState(null);

    const [activeTab, setActiveTab] = useState("organizers-content");

    const [certificate, setCertificate] = useState(null);

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

    useEffect(() => {
        if (activeVideo) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [activeVideo]);

    const isJanuaryWebinar = moment(webinar?.date).month() === 0; // January = 0

    // Determine button text and style based on webinar actions
    const buttonText = webinar.actions?.canStartProgram
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
                        <p className={styles.description}>
                            {webinar.description}
                        </p>

                        <div className={styles.contentsection}>
                            <h2>What You'll Learn</h2>
                            <ul>
                                {webinar.features.map((item) => (
                                    <li key={item._id}>{item.feature}</li>
                                ))}
                            </ul>
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
                                        className={`${styles.audiencetab} ${activeTab === "organizers-content" ? styles.active : ""
                                            }`}
                                        onClick={() => handleTabClick("organizers-content")}
                                    >
                                        <img
                                            src="/attend2.png"
                                            alt="Organizers"
                                            className={styles.tabicon}
                                        />
                                        For Organizers
                                    </div>
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

                                        <ul className={styles.learninglist}>
                                            {webinar?.schoolBenifits?.features?.map((item, index) => (
                                                <li key={index} className={styles.learningitem}>
                                                    <span className={styles.learningtext}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}


                                        </ul>

                                        <div className={styles.contentsection}>
                                            <h2 className={styles.sectiontitle}>Why This Matters for Your Institution</h2>

                                            {/* <div className={styles.benefitsgrid}>
                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend1.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
                          {webinar?.schoolBenifits?.features?.[3]}
                        </p>
                      </div>
                    </div> */}
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
                                                        {webinar?.schoolBenifits?.whyNeeded?.[0]}
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
                                                        {webinar?.schoolBenifits?.whyNeeded?.[1]}
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
                                                        {webinar?.schoolBenifits?.whyNeeded?.[2]}
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
                                </div>


                                <div
                                    id="resellers-content"
                                    className={`${styles.tabcontent} ${activeTab === "resellers-content" ? styles.active : ""
                                        }`}
                                >
                                    <div className={styles.contentsection}>
                                        <h2 className={styles.sectiontitle}>Partner Opportunities</h2>

                                        <ul className={styles.learninglist}>
                                            {webinar?.resellerBenifits?.features?.map((item, index) => (
                                                <li key={index} className={styles.learningitem}>
                                                    <span className={styles.learningtext}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}


                                        </ul>

                                        {/* <div className={styles.benefitsgrid}>
                      <div className={styles.benefitcard}>
                        <span className={styles.benefiticon}>
                          <img
                            src="/attend5.png"
                            alt="Teacher Development"
                            className={styles.benefiticonImage}
                          />
                        </span>
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
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
                        <p className={styles.benefitdescription}>
                          {webinar?.resellerBenifits?.features?.[3]}

                        </p>
                      </div>
                    </div> */}

                                        <div className={styles.contentsection}>
                                            <h2 className={styles.sectiontitle}>Why Partner with This Solution</h2>
                                        </div>

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
                                                    {webinar?.resellerBenifits?.whyNeeded?.[0]}
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
                                                    {webinar?.resellerBenifits?.whyNeeded?.[1]}
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
                                                    {webinar?.resellerBenifits?.whyNeeded?.[2]}
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
                                    id="organizers-content"
                                    className={`${styles.tabcontent} ${activeTab === "organizers-content" ? styles.active : ""
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

                                            {webinar?.competitionOrganizars?.features?.map((item, index) => (
                                                <li key={index} className={styles.learningitem}>
                                                    <span className={styles.learningtext}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}


                                        </ul>
                                    </div>

                                    <div className={styles.contentsection}>
                                        <h2 className={styles.sectiontitle}>Why This is Valuable</h2>

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
                                                    {webinar?.competitionOrganizars?.whyNeeded?.[0]}
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
                                                    {webinar?.competitionOrganizars?.whyNeeded?.[1]}
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
                                                    {webinar?.competitionOrganizars?.whyNeeded?.[2]}
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
                            </>
                        )}


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
                                {webinar.isFree ? "FREE" : `₹${webinar.price}`}
                            </div>

                            <Link href={href} className={buttonClass}>
                                {buttonText}
                            </Link>

                            {webinar.bonus?.title && (
                                <div className={styles.regbonus}>
                                    <div className={styles.label}>BONUS</div>
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
        </section>
    );
};

export default RegisterComp2;
