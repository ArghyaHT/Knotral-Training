"use client";

import moment from "moment";
import styles from "./MyPastSessions.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyPastSessions() {
    const router = useRouter();

    const { user, logout } = useAuth();
    const [webinars, setWebinars] = useState([]);

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

    const totalCompletedSessions = webinars.filter((item) =>
        moment(item.webinarDate).isBefore(moment())
    );


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

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Past Sessions</h1>
                <p>Sessions you have already attended</p>
            </div>

            <div className={styles.grid}>
                {matchingPastSessions && matchingPastSessions.length > 0 ? (
                    matchingPastSessions.map((past) => (
                        <div key={past._id} className={styles.card}>

                            <div className={styles.thumb}>
                                <img
                                    src={`https://img.youtube.com/vi/${past.youtubeId}/maxresdefault.jpg`}
                                    alt={past.webinarTitle}
                                />
                            </div>

                            <div className={styles.info}>
                                <div className={styles.title}>
                                    {past.webinarTitle}
                                </div>

                                <div className={styles.meta}>
                                    {past.webinarOrganiser} ·{" "}
                                    {moment(past.date).format("D MMMM YYYY")} ·{" "}
                                    {past.webinarTime}
                                </div>
                            </div>

                            <div className={styles.actions}>
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
                    <div className={styles.emptyWrapper}>
                        <div className={styles.empty}>
                            No past sessions attended yet.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}