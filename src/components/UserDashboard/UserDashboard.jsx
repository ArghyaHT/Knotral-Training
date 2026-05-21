"use client";

import React, { useEffect, useState } from 'react'
import styles from "./UserDashboard.module.css";
import { useAuth } from '@/context/AuthContext';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const UserDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [webinars, setWebinars] = useState([]);
  const [allWebinars, setAllWebinars] = useState([]);
  const [selected, setSelected] = useState();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {

    if (!user?.email) return;

    const fetchWebinars = async () => {
      try {

        const res = await fetch(`${API}/user/get-user-webinars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userEmail: user.email
          })
        });

        const data = await res.json();

        if (data.success) {
          setWebinars(data.response);
        }

      } catch (error) {
        console.error("Error fetching webinars:", error);
      }
    };

    fetchWebinars();

  }, [user]);

  useEffect(() => {
    const fetchAllWebinars = async () => {
      const res = await fetch(`${API}/webinars/get-webinars`);
      const data = await res.json();

      if (data.success) {
        setAllWebinars(data.response);
      }
    };

    fetchAllWebinars();
  }, []);

  const upcomingCount = webinars.filter((item) =>
    moment(item.webinarDate).isBetween(
      moment(),
      moment().add(30, "days"),
      null,
      "[]"
    )
  ).length;

  const completedSessions = webinars.filter((item) =>
    moment(item.webinarDate).isBefore(moment())
  ).length;

  const totalCompletedSessions = webinars.filter((item) =>
    moment(item.webinarDate).isBefore(moment())
  );

  const completedThisMonth = webinars.filter((w) =>
    moment(w.webinarDate).isBetween(moment().startOf("month"), moment(), null, "[]")
  ).length;

  const nextWebinar = webinars
    .filter((item) => moment(item.webinarDate).isAfter(moment()))
    .sort((a, b) => new Date(a.webinarDate) - new Date(b.webinarDate))[0];

  const nextWebinarDate = nextWebinar
    ? moment(nextWebinar.webinarDate).format("D MMMM")
    : "No upcoming sessions";

  const upcomingWebinars = webinars
    .filter((item) => moment(item.webinarDate).isAfter(moment()))
    .sort((a, b) => new Date(a.webinarDate) - new Date(b.webinarDate));


  const upcomingCategories = upcomingWebinars.flatMap(
    (w) => w.webinar?.category || []
  );

  const uniqueCategories = [...new Set(upcomingCategories)];

  const registeredWebinars = webinars.map((w) => ({
  webinarId: w.webinar?._id || w.webinar,
  date: w.webinarDate,
}));

const recommendedWebinars = allWebinars
  .filter((webinar) => {
    const matchCategory =
      uniqueCategories.length === 0 ||
      webinar.category?.some((cat) =>
        uniqueCategories.includes(cat)
      );

    const isFuture = moment(webinar.date).endOf("day").isAfter(moment());
    const isActive = !webinar.isStopped;

    const notRegistered = !registeredWebinars.some(
      (r) =>
        r.webinarId === webinar._id &&
        moment(r.date).isSame(webinar.date, "day")
    );

    return matchCategory && notRegistered && isFuture && isActive;
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 4);

console.log("Recommended webinars:", recommendedWebinars);

  const certifiedWebinars = allWebinars
    .filter(
      (webinar) =>
        webinar?.isLive && 
       webinar?.isCertified &&                     // ✅ only LIVE webinars
        moment(webinar.date).isAfter(moment())       // ✅ future webinars
      // !registeredIds.includes(webinar._id) &&        // optional (exclude registered)
      // !webinar.isStopped                             // optional (exclude stopped)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const hasEvent = (date) => {
    return upcomingWebinars.some((w) => {
      const d = new Date(w.webinarDate);

      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };


  const getPastSessionsForCompleted = (completedSessions) => {
    return completedSessions.flatMap((session) => {

      const webinarMonth = moment(session.webinarDate).month();
      const webinarYear = moment(session.webinarDate).year();

      const pastSessions = session.webinar?.pastSessions || [];

      return pastSessions
        .filter((past) => {
          const pastMonth = moment(past.date).month();
          const pastYear = moment(past.date).year();

          return pastMonth === webinarMonth && pastYear === webinarYear;
        })
        .map((past) => ({
          ...past,
          webinarTitle: session.webinar?.title,
          webinarTime: session?.webinar.duration,
          webinarOrganiser: session.webinar?.organisedBy,
        }));

    });
  };

  const matchingPastSessions = getPastSessionsForCompleted(totalCompletedSessions);


  // const addToGoogleCalendar = async (item, accessToken) => {
  //   try {
  //     const start = new Date(item.webinarDate);

  //     // Convert duration to minutes
  //     let durationMinutes = 60; // default
  //     const durationStr = item.webinar.duration.toLowerCase();
  //     if (durationStr.includes("hour")) {
  //       durationMinutes = parseFloat(durationStr) * 60;
  //     } else if (durationStr.includes("minute")) {
  //       durationMinutes = parseFloat(durationStr);
  //     }

  //     const end = new Date(start.getTime() + durationMinutes * 60000);

  //     // Prepare the event payload
  //     const event = {
  //       summary: item.webinar.title,
  //       description: item.webinar.organisedBy || "Webinar",
  //       start: { dateTime: start.toISOString() },
  //       end: { dateTime: end.toISOString() },
  //       location: "Online",
  //     };

  //     // Make the API call
  //     const response = await fetch(
  //       "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${user.token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(event),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error("Error creating calendar event:", errorData);
  //       alert("Failed to add event to Google Calendar");
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Event created successfully:", data);
  //     alert("Event added to Google Calendar!");
  //   } catch (err) {
  //     console.error("Unexpected error:", err);
  //     alert("Error adding event to Google Calendar");
  //   }
  // };

  return (
    <>
      <main className={styles.dashboardMain}>
        <div className={styles.greetingHero}>
          <div className={styles.greetingText}>
            <h1>
              Hi, <em style={{ color: "var(--teal)" }}> {user?.firstName} {user?.lastName}</em>
            </h1>

            <p>
              You have{" "}
              {/* <strong style={{ color: "#fff" }}>
                2 sessions in progress
              </strong>{" "} */}
              a live training coming up on{" "}
              <strong style={{ color: "var(--teal)" }}>
                {nextWebinarDate}
              </strong>
              {/* . You're 62% towards your annual CPD goal — keep it up! */}
            </p>

            {/* <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <a
                href="#"
                className="btn btnprimary"
              >
                Browse Library
              </a>

              <a
                href="#"
                className="btn btnoutline"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              >
                View CPD Log
              </a>
            </div> */}
          </div>

          <div className={styles.cpdRingWrap}>
            {/* <div className={styles.cpdRing}>
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="7"
                />

                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#00A693"
                  strokeWidth="7"
                  strokeDasharray="251.2"
                  strokeDashoffset="95.5"
                  strokeLinecap="round"
                />
              </svg>

              <div className={styles.cpdRingInner}>
                <div className={styles.cpdRingVal}>62%</div>
                <div className={styles.cpdRingLabel}>CPD Goal</div>
              </div>
            </div> */}

            <div className={styles.cpdDetails}>
              <div className={styles.cpdDetailsTitle}>This year</div>

              {/* <div className={styles.cpdStatRow}>
                <div className={styles.cpdStat}>
                  <div className={styles.cpdStatVal}>18.5h</div>
                  <div className={styles.cpdStatLbl}>Logged</div>
                </div>

                <div className={styles.cpdStat}>
                  <div className={styles.cpdStatVal}>30h</div>
                  <div className={styles.cpdStatLbl}>Target</div>
                </div>
              </div> */}

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {completedSessions} sessions completed
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div
              className={styles.statCardAccent}
              style={{ background: "var(--teal)" }}
            ></div>

            <div
              className={styles.statIcon}
              style={{ background: "var(--teal-light-sp)" }}
            >
              ▷
            </div>

            <div className={styles.statLabel}>Sessions completed</div>

            <div className={styles.statValue}>{completedSessions}</div>

            <div className={`${styles.statDelta} ${styles.deltaUp}`}>
              ↑ +{completedThisMonth} this month
            </div>
          </div>
          {/* 
          <div className={styles.statCard}>
            <div
              className={styles.statCardAccent}
              style={{ background: "var(--gold)" }}
            ></div>

            <div
              className={styles.statIcon}
              style={{ background: "var(--gold-light)" }}
            >
              🏅
            </div>

            <div className={styles.statLabel}>Certificates earned</div>

            <div className={styles.statValue}>6</div>

            <div className={`${styles.statDelta} ${styles.deltaUp}`}>
              ↑ +1 this month
            </div>
          </div> */}

          {/* <div className={styles.statCard}>
            <div
              className={styles.statCardAccent}
              style={{ background: "var(--purple)" }}
            ></div>

            <div
              className={styles.statIcon}
              style={{ background: "var(--purple-light)" }}
            >
              ◑
            </div>

            <div className={styles.statLabel}>CPD hours logged</div>

            <div className={styles.statValue}>18.5h</div>

            <div className={`${styles.statDelta} ${styles.deltaUp}`}>
              ↑ +2.5h this week
            </div>
          </div> */}

          <div className={styles.statCard}>
            <div
              className={styles.statCardAccent}
              style={{ background: "var(--orange)" }}
            ></div>

            <div
              className={styles.statIcon}
              style={{ background: "var(--orange-light)" }}
            >
              ◈
            </div>

            <div className={styles.statLabel}>Upcoming sessions</div>

            <div className={styles.statValue}>{upcomingCount}</div>

            <div className={`${styles.statDelta} ${styles.deltaNeutral}`}>
              Next 30 days
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>

          {/* LEFT COLUMN */}
          <div className={styles.mainCol}>

            {/* CONTINUE WATCHING */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Past Sessions</h3>
                <Link href="/my-past-sessions" className="viewall">
                  View All →
                </Link>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.continueGrid}>
                  {matchingPastSessions && matchingPastSessions.length > 0 ? (
                    matchingPastSessions.slice(0, 3).map((past) => (
                      <div key={past._id} className={styles.continueItem}>
                        <div className={styles.thumb}>
                          <img
                            src={`https://img.youtube.com/vi/${past.youtubeId}/maxresdefault.jpg`}
                            alt={past.title}
                          />
                          {/* <div className={styles.playoverlay}>▶</div> */}
                        </div>

                        <div className={styles.continueInfo}>
                          <div className={styles.titleRow}>
                            <div className={styles.continueTitle}>{past.webinarTitle}</div>

                            {/* <div className={styles.badges}>
                              {past.isFree ? (
                                <span className="badge badgefree">FREE</span>
                              ) : (
                                <span className="badge badgenew">PAID</span>
                              )}

                              {past.isCertified && (
                                <span className="badge badgecert">CERTIFIED</span>
                              )}
                            </div> */}
                          </div>
                          <div className={styles.continueMeta}>
                            {past.webinarOrganiser} · {moment(past.date).format("D MMMM YYYY")} · {past.webinarTime}
                          </div>
                        </div>

                        <div className={styles.pastActions}>
                          <span className="badge badgecert">REC</span>

                          <a
                            href={`https://www.youtube.com/watch?v=${past.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btnsm btnprimary"
                          >
                            Watch
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No past sessions attended yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* UPCOMING SESSIONS */}

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Upcoming registered sessions</h3>
                <Link href="/my-webinars" className="viewall">
                  View All →
                </Link>
              </div>

              <div className={styles.cardBody}>
                {upcomingWebinars && upcomingWebinars.length > 0 ? (
                  upcomingWebinars.slice(0, 3).map((item) => (
                    <div key={item._id} className={styles.upcomingItem}>
                      <div className={styles.dateChip}>
                        <div className={styles.dateDay}>
                          {moment(item.webinarDate).format("D")}
                        </div>
                        <div className={styles.dateMon}>
                          {moment(item.webinarDate).format("MMM")}
                        </div>
                      </div>

                      <div className={styles.upcomingInfo}>
                        <div className={styles.upcomingTitle}>
                          {item.webinar?.title}
                        </div>

                        <div className={styles.upcomingMeta}>
                          {moment(item.webinarDate).format("h:mm A")} IST · {item.webinar?.organisedBy} · {item.webinar?.mode} · {item.webinar?.duration}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 7,
                            flexWrap: "wrap",
                          }}
                        >
                          {item.webinar?.isLive && (
                            <span className="badge badgelive">LIVE</span>
                          )}

                          {item.webinar?.isFree ? (
                            <span className="badge badgefree">FREE</span>
                          ) : (
                            <span className="badge badgenew">PAID</span>
                          )}

                          {item.webinar?.isCertified && (
                            <span className="badge badgecert">CERTIFIED</span>
                          )}

                          <span className={styles.chip}>
                            ⏰ {moment(item.webinarDate).fromNow()}
                          </span>
                        </div>
                      </div>

                      <div className={styles.upcomingActions}>
                        {/* <button
                          className="btn btnprimary btnsm"
                        // onClick={() => addToGoogleCalendar(item)}
                        >
                          Add to Calendar
                        </button> */}

                        <button
                          className="btn btnsecondary btnsm"
                          style={{ color: "#ffffff" }}
                          onClick={() => router.push(`/${item.webinar.slug}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No upcoming sessions.</div>
                )}
              </div>
            </div>


            {/* CERTIFIED SESSIONS */}

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recommended Certified sessions</h3>
                <Link href="/my-webinars" className="viewall">
                  View All →
                </Link>
              </div>

              <div className={styles.cardBody}>
                {certifiedWebinars && certifiedWebinars.length > 0 ? (
                  certifiedWebinars
                    .map((item) => (
                      <div key={item._id} className={styles.upcomingItem}>
                        <div className={styles.dateChip}>
                          <div className={styles.dateDay}>
                            {moment(item.date).format("D")}
                          </div>
                          <div className={styles.dateMon}>
                            {moment(item.date).format("MMM")}
                          </div>
                        </div>

                        <div className={styles.upcomingInfo}>
                          <div className={styles.upcomingTitle}>
                            {item.title}
                          </div>

                          <div className={styles.upcomingMeta}>
                            {moment(item.date).format("h:mm A")} IST · {item.organisedBy} · {item.mode} · {item.duration}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              marginTop: 7,
                              flexWrap: "wrap",
                            }}
                          >
                            {item.isLive && (
                              <span className="badge badgelive">LIVE</span>
                            )}

                            {item.isFree ? (
                              <span className="badge badgefree">FREE</span>
                            ) : (
                              <span className="badge badgenew">PAID</span>
                            )}

                            {item.isCertified && (
                              <span className="badge badgecert">CERTIFIED</span>
                            )}

                            <span className={styles.chip}>
                              ⏰ {moment(item.date).fromNow()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.upcomingActions}>

                          <button
                            className="btn btnsecondary btnsm"
                            style={{ color: "#ffffff" }}
                            onClick={() => router.push(`/${item.slug}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div>No upcoming certified sessions.</div>
                )}
              </div>
            </div>


            {/* RECOMMENDED FOR YOU */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recommended for you</h3>
                <Link href="/webinars?page=1" className="viewall">
                  View All →
                </Link>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.recGrid}>

                  {recommendedWebinars?.length > 0 ? (
                    recommendedWebinars.map((webinar) => (
                      <div
                        key={webinar._id}
                        className={styles.recCard}
                        onClick={() => {
                          router.push(`/${webinar.slug}`);
                        }}
                      >
                        <div className={styles.recThumb}>
                          <img
                            src={webinar.logo?.url}
                            alt={webinar.title}
                            className={styles.recImage}
                          />
                        </div>

                        <div className={styles.recBody}>
                          <div className={styles.recTitle}>{webinar.title}</div>

                          <div className={styles.recMeta}>
                            {moment(webinar.date).format("D MMMM")}
                          </div>

                          <div className={styles.recMeta}>
                            {webinar.organisedBy} · {webinar.duration}
                          </div>

                          <div className={styles.recTags}>
                            {webinar?.isLive && (
                              <span className="badge badgelive">LIVE</span>
                            )}

                            <span
                              className={`badge ${webinar.isFree ? "badgefree" : "badgepaid"
                                }`}
                            >
                              {webinar.isFree ? "FREE" : "PAID"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No recommended webinars available.</div>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}

          <div className={styles.sideCol}>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Session calendar</h3>
                {/* <span className="badge badgeteal">April 2026</span> */}
              </div>

              <div className={styles.cardBody} style={{ paddingBottom: "12px" }}>

                {/* <div className={styles.miniCalHeader}>
                  <span className={styles.miniCalMonth}>April 2026</span>

                  <div style={{ display: "flex", gap: "2px" }}>
                    <button className={styles.calNav}>‹</button>
                    <button className={styles.calNav}>›</button>
                  </div>
                </div> */}

                {/* <div className={styles.calGrid}>
                  <div className={styles.calDayLabel}>Mo</div>
                  <div className={styles.calDayLabel}>Tu</div>
                  <div className={styles.calDayLabel}>We</div>
                  <div className={styles.calDayLabel}>Th</div>
                  <div className={styles.calDayLabel}>Fr</div>
                  <div className={styles.calDayLabel}>Sa</div>
                  <div className={styles.calDayLabel}>Su</div>

                  <div className={`${styles.calDay} ${styles.otherMonth}`}>31</div>
                  <div className={styles.calDay}>1</div>
                  <div className={styles.calDay}>2</div>
                  <div className={`${styles.calDay} ${styles.today} ${styles.hasEvent}`}>3</div>
                  <div className={styles.calDay}>4</div>
                  <div className={styles.calDay}>5</div>
                  <div className={styles.calDay}>6</div>

                  <div className={styles.calDay}>7</div>
                  <div className={styles.calDay}>8</div>
                  <div className={styles.calDay}>9</div>
                  <div className={styles.calDay}>10</div>
                  <div className={styles.calDay}>11</div>
                  <div className={styles.calDay}>12</div>
                  <div className={styles.calDay}>13</div>

                  <div className={styles.calDay}>14</div>
                  <div className={styles.calDay}>15</div>
                  <div className={styles.calDay}>16</div>
                  <div className={styles.calDay}>17</div>
                  <div className={`${styles.calDay} ${styles.hasEvent}`}>18</div>
                  <div className={styles.calDay}>19</div>
                  <div className={styles.calDay}>20</div>

                  <div className={styles.calDay}>21</div>
                  <div className={styles.calDay}>22</div>
                  <div className={styles.calDay}>23</div>
                  <div className={styles.calDay}>24</div>
                  <div className={`${styles.calDay} ${styles.hasEvent}`}>25</div>
                  <div className={styles.calDay}>26</div>
                  <div className={styles.calDay}>27</div>

                  <div className={styles.calDay}>28</div>
                  <div className={styles.calDay}>29</div>
                  <div className={styles.calDay}>30</div>
                  <div className={`${styles.calDay} ${styles.otherMonth}`}>1</div>
                  <div className={`${styles.calDay} ${styles.otherMonth} ${styles.hasEvent}`}>2</div>
                  <div className={`${styles.calDay} ${styles.otherMonth}`}>3</div>
                  <div className={`${styles.calDay} ${styles.otherMonth}`}>4</div>
                </div> */}
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  modifiers={{ event: hasEvent }}
                  modifiersClassNames={{
                    event: "hasEvent",
                    today: "calendarToday",
                    selected: "calendarSelected"
                  }}
                  classNames={{
                    chevron: "calendarChevron",
                    nav_button: "calendarNavBtn"
                  }}
                />

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-3)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                    }}
                  >
                    Upcoming
                  </div>

                  {upcomingWebinars?.length > 0 ? (
                    upcomingWebinars.slice(0, 3).map((item, index) => {
                      const colors = ["var(--orange)", "var(--green)", "var(--purple)"];

                      return (
                        <div
                          key={item._id}
                          onClick={() => router.push(`/${item.webinar?.slug}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "7px",
                            fontSize: "12.5px",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "2px",
                              background: colors[index % colors.length],
                              flexShrink: 0,
                            }}
                          ></div>

                          <span style={{ color: "var(--text-2)" }}>
                            {moment(item.webinarDate).format("MMM D")} —{" "}
                            {item.webinar?.title?.length > 25
                              ? item.webinar.title.slice(0, 25) + "..."
                              : item.webinar?.title}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: "12.5px", color: "var(--text-2)" }}>
                      No upcoming webinars
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
};

export default UserDashboard;