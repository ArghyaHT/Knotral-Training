import React from 'react';
import Link from 'next/link';
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
            <div className="container">

        <div className={styles.footergrid}>
          <div className={styles.footerbrand}>
              <Link href="/" className={styles.logo}>
                <img
                  src="/KnotralFoot.png"      
                  alt="Knotral Footer"
                  className={styles.logoImage}
                  
                />
              </Link>
            <p>
              Knowledge. Trade. Link.<br />
              Connecting global education solutions with Indian schools.<br />
              Ph No: 9311526122 <br />
              Email: <a href="mailto:training@knotral.com" className={styles.emailLink}>training@knotral.com</a>
            </p>
          </div>

          <div className={styles.footercol}>
            <h4>Browse</h4>
            {/* <Link href="/webinars?page=1&category=provider" className={styles.link}>By Subject</Link> */}
            <Link href="/webinars?page=1&sort=provider" className={styles.link}>By Provider</Link>
            <Link href="/webinars?page=1&type=certified" className={styles.link}>Certifications</Link>
            <Link href="/webinars?page=1&type=ondemand" className={styles.link}>On-Demand</Link>
          </div>

          <div className={styles.footercol}>
            <h4>About</h4>
            <Link href="/about" className={styles.link}>About Us</Link>
            <Link href="https://indiamarketentry.zohorecruit.in/jobs/Careers" target="_blank" rel="noopener noreferrer" className={styles.link}>Careers</Link>
            <Link href="/sitemap" className={styles.link}>Sitemap</Link>
          </div>

          <div className={styles.footercol}>
            <h4>Support</h4>
            {/* <Link href="/" className={styles.link}>Help Center</Link> */}
            <Link href="/contact-us" className={styles.link}>Contact</Link>
            <Link href="/faq" className={styles.link}>FAQ</Link>
          </div>
        </div>

        <div className={styles.footerbottom}>
          © 2026 Knotral. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
