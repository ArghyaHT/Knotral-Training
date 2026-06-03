"use client";
import React, { useEffect, useState } from "react";
import styles from "./ThankYou.module.css";
import moment from "moment";


const ThankYou = ({ webinar }) => {

    const [webinars, setWebinars] = useState([]);

    const [remaining, setRemaining] = useState(15);

    // ✅ Countdown
    useEffect(() => {
        if (!webinar) return;

        const timer = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = webinar?.productUrl || "/";
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [webinar]);

    if (!webinar) return <p>Loading...</p>;

    const handleClick = () => {
        const redirectUrl = webinar?.link ? webinar.link : "https://knotral.com";
        window.location.href = redirectUrl;
    };


    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/webinars/get-webinars`
                );

                const data = await res.json();

                if (data.success) {
                    setWebinars(data.response);
                }
            } catch (err) {
                console.error("Error fetching webinars:", err);
            }
        };

        fetchWebinars();
    }, []);

    const filteredWebinars = webinars
        ?.filter((w) => w.slug !== webinar?.slug) // remove current
        ?.filter((w) => w.isLive) // only live webinars
        ?.filter((w) =>
            w.category?.some((cat) =>
                webinar?.category?.includes(cat)
            )
        );

    const progress = ((15 - remaining) / 15) * 100;

    return (
        <>
            <div
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
            ></div>

            <div className={styles.hero}>
                <div className={styles.checkmarkRing}>
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h1>
                    You're <span>Registered!</span>
                </h1>

                <p className={styles.sub}>
                    Your spot is confirmed. Check your email for the joining link and
                    calendar invite.
                </p>

                <div className={styles.sessionCard}>
                    <div className={styles.sessionLogo}>
                        <img
                            src={
                                webinar.logo.url ||
                                "https://training.knotral.com/7.png"
                            }
                            alt={webinar.title}
                        />
                    </div>

                    <div className={styles.sessionInfo}>
                        <div className={styles.label}>Your Session</div>
                        <div className={styles.name}>{webinar.title}</div>
                        <div className={styles.meta}>
                            {[moment(webinar.date).format("DD MMM YYYY"), webinar.startTime]
                                .filter(Boolean)
                                .join(" · ") || "Check your email for details"}
                        </div>
                    </div>
                </div>
            </div>

            <main className={styles.main}>
                <div className={styles.stepsGrid}>
                    <div className={styles.stepCard}>
                        <div className={`${styles.stepIcon} ${styles.iconTeal}`}>📧</div>
                        <h3>Check Your Email</h3>
                        <p>
                            A confirmation with your Zoom / Meet link has been sent. Add it to
                            your calendar now.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={`${styles.stepIcon} ${styles.iconGold}`}>🎓</div>
                        <h3>Attend & Certify</h3>
                        <p>
                            Attend the full live session to receive your globally recognised
                            certification on completion.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={`${styles.stepIcon} ${styles.iconNavy}`}>🔗</div>
                        <h3>Explore the Product</h3>
                        <p>
                            Dive deeper — see pricing, school onboarding, and demo resources.
                        </p>
                    </div>
                </div>

                <div className={styles.productCta}>
                    <div className={styles.ctaLeft}>
                        <div className={styles.ctaEyebrow}>Next Step</div>

                        {/* <h2>
                            {sessionData.product
                                ? `Explore ${sessionData.session.split(":")[0]} on Knotral`
                                : "Explore the Full Product on Knotral"}
                        </h2> */}
                        <h2>
                            Explore {webinar?.organisedBy || webinar?.title} on Knotral
                        </h2>

                        <p>
                            See how this solution can transform learning in your school —
                            features, demo videos, pricing and onboarding support.
                        </p>

                        <button
                            onClick={handleClick}
                            className={styles.btnExplore}
                        >
                            View Product Page →
                        </button>
                    </div>

                    <div className={styles.countdownWrap}>
                        <div className={styles.countdownLabel}>
                            Auto-redirecting in
                        </div>
                        <div className={styles.countdown}>
                            {remaining}
                            <small> seconds</small>
                        </div>
                    </div>
                </div>

                <div className={styles.whatsappSection}>
                    <div className={styles.whatsappContent}>
                        <div className={styles.whatsappIcon}>💬</div>
                        <h2>Join Our WhatsApp Community</h2>
                        <p>
                            To receive important updates, reminders, session materials, and support,
                            please join our official WhatsApp Community.
                        </p>
                        <a
                            href="https://chat.whatsapp.com/GzphiwBuZWSAxtP8xHNKqs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappBtn}
                        >
                            Join the WhatsApp Community Now
                        </a>
                    </div>
                </div>

                <div className={styles.webinarsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            More <span>Upcoming Sessions</span>
                        </h2>
                        <a className={styles.seeAll} href="https://training.knotral.com/webinars?page=1">
                            View All
                            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </a>
                    </div>

                    <div className={styles.webinarsGrid}>
                        {filteredWebinars.length === 0 ? (
                            <p className={styles.noData}>
                                No other upcoming sessions right now.
                            </p>
                        ) : (
                            filteredWebinars.map((w, i) => (
                                <div
                                    key={i}
                                    className={styles.wbCard}
                                    style={{ animationDelay: `${0.7 + i * 0.08}s` }}
                                >
                                    <div className={styles.wbTop}>
                                        <div className={styles.wbBadges}>
                                            {w.isLive && (
                                                <span className={`${styles.badge} ${styles.badgeLIVE}`}>
                                                    Live
                                                </span>
                                            )}

                                            {w.isFree && (
                                                <span className={`${styles.badge} ${styles.badgeFREE}`}>
                                                    Free
                                                </span>
                                            )}

                                            {w.isCertified && (
                                                <span className={`${styles.badge} ${styles.badgeCERTIFIED}`}>
                                                    Certified
                                                </span>
                                            )}

                                        </div>

                                        <img
                                            className={styles.wbLogo}
                                            src={w.logo.url}
                                            alt={w.organisedBy}
                                        />
                                    </div>

                                    <div className={styles.wbBody}>
                                        <div className={styles.wbProvider}>{w.organisedBy}</div>
                                        <div className={styles.wbTitle}>{w.title}</div>

                                        <div className={styles.wbMeta}>
                                            <span>📅 {moment(w.date).format("DD MMM YYYY")}</span>
                                            <span>⏱️ {w.duration}</span>
                                        </div>
                                    </div>

                                    <div className={styles.wbFooter}>
                                        <span className={styles.wbPrice}>
                                            {w.isFree ? "Free" : w.price}
                                        </span>
                                        <a
                                            href={`https://training.knotral.com/${w.slug}`}
                                            className={styles.wbRegister}
                                            target="_blank"
                                        >
                                            Register →
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>


        </>
    );
};

export default ThankYou;