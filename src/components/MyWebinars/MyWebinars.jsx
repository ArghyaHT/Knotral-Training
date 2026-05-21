"use client";
import { useRouter } from "next/navigation";
import moment from "moment";
import styles from "./MyWebinars.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyWebinars() {
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


        const upcomingWebinars = webinars
          .filter((item) => moment(item.webinarDate).isAfter(moment()))
          .sort((a, b) => new Date(a.webinarDate) - new Date(b.webinarDate));
      

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Upcoming Registered Sessions</h1>
        <p>Your upcoming webinars and courses</p>
      </div>

      <div className={styles.list}>

        {upcomingWebinars.length === 0 && (
          <div className={styles.empty}>
            No upcoming sessions
          </div>
        )}

        {upcomingWebinars.map((item) => (
          <div key={item._id} className={styles.sessionCard}>
            
            <div className={styles.dateChip}>
              <div className={styles.day}>
                {moment(item.webinarDate).format("D")}
              </div>
              <div className={styles.month}>
                {moment(item.webinarDate).format("MMM")}
              </div>
            </div>

            <div className={styles.info}>
              <h3>{item.webinar?.title}</h3>

              <div className={styles.meta}>
                {moment(item.webinarDate).format("h:mm A")} IST ·{" "}
                {item.webinar?.organisedBy} · {item.webinar?.mode} ·{" "}
                {item.webinar?.duration}
              </div>

              <div className={styles.badges}>
                {item.webinar?.isLive && (
                  <span className="badge badgelive">LIVE</span>
                )}

                {item.webinar?.isFree ? (
                  <span className="badge badgefree">FREE</span>
                ) : (
                  <span className="badge badgenew">PAID</span>
                )}

                {item.webinar?.isCertified && (
                  <span className="badge badgecert">CERTIFICATE</span>
                )}

                <span className={styles.timeChip}>
                  ⏰ {moment(item.webinarDate).fromNow()}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              {/* <button className="btn btnprimary btnsm">
                Add to Calendar
              </button> */}

              <button
                className="btn btnsecondary btnsm"
                onClick={() => router.push(`/${item.webinar.slug}`)}
              >
                View Details
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}