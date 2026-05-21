"use client";

import React, { useEffect, useState } from 'react'
import styles from "./Header.module.css"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';

import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from '@/context/AuthContext';


const Header = () => {

  const pathname = usePathname();

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      {/* <div className={`${styles.container} container`}> */}
      <div className={styles.container}>

        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            <img
              src="/7.png"       // path in /public folder
              alt="Knotral Logo"
              className={styles.logoImage}
            />
          </Link>
        </div>
        {/* <nav className={styles.navLinks}>
          <Link
            href="/for-teachers"
            className={`${styles.navLink} ${pathname === "/for-teachers" ? styles.active : ""
              }`}
          >
            For Teachers
          </Link>
          <Link
            href="/for-schools"
            className={`${styles.navLink} ${pathname === "/for-schools" ? styles.active : ""
              }`}
          >
            For Schools</Link>
          <Link
            href="/for-solution-providers"
            className={`${styles.navLink} ${pathname === "/for-solution-providers" ? styles.active : ""
              }`}
          >
            For Solution Providers</Link>

          {user && (
            <Link
              href="/user-dashboard"
              className={`${styles.navLink} ${pathname === "/user-dashboard" ? styles.active : ""}`}
            >
              Dashboard
            </Link>
          )}
        </nav> */}

        <nav className={styles.navLinks}>
          {!user ? (
            <>
              <Link
                href="/for-teachers"
                className={`${styles.navLink} ${pathname === "/for-teachers" ? styles.active : ""}`}
              >
                For Teachers
              </Link>

              <Link
                href="/for-schools"
                className={`${styles.navLink} ${pathname === "/for-schools" ? styles.active : ""}`}
              >
                For Schools
              </Link>

              <Link
                href="/for-solution-providers"
                className={`${styles.navLink} ${pathname === "/for-solution-providers" ? styles.active : ""}`}
              >
                For Solution Providers
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/my-past-sessions"
                className={`${styles.navLink} ${pathname === "/my-past-sessions" ? styles.active : ""}`}
              >
                Past Sessions
              </Link>

              <Link
                href="/my-webinars"
                className={`${styles.navLink} ${pathname === "/my-webinars" ? styles.active : ""}`}
              >
                My Webinars
              </Link>

              <Link
                href="/user-dashboard"
                className={`${styles.navLink} ${pathname === "/user-dashboard" ? styles.active : ""}`}
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* <div className={styles.headerActions}>
          <Link href="/login" className="btn btnghost">Login</Link>
          <Link href="/sign-up" className="btn btnprimary">Sign Up</Link>
        </div> */}

        <div className={styles.headerActions}>
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setOpen(!open)}
              >
                <div className={styles.avatar}>
                  {user.firstName?.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </div>

                <span>
                  {user.firstName} {user.lastName}
                </span>
              </button>

              {open && (
                <div className={styles.dropdown}>
                  <button onClick={() => router.push("/edit-profile")}>
                    Edit Profile
                  </button>
                  <button onClick={() => router.push("/forget-password")}>
                    Change Password
                  </button>
                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btnghost">Login</Link>
              <Link href="/sign-up" className="btn btnprimary">Sign Up</Link>
            </>
          )}
        </div>


        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>

          {!user ? (
            <>
              <Link
                href="/for-teachers"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/for-teachers" ? styles.active : ""}`}
              >
                For Teachers
              </Link>

              <Link
                href="/for-schools"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/for-schools" ? styles.active : ""}`}
              >
                For Schools
              </Link>

              <Link
                href="/for-solution-providers"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/for-solution-providers" ? styles.active : ""}`}
              >
                For Solution Providers
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/user-dashboard"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/user-dashboard" ? styles.active : ""}`}
              >
                Dashboard
              </Link>

              <Link
                href="/my-past-sessions"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/my-past-sessions" ? styles.active : ""}`}
              >
                Past Sessions
              </Link>

              <Link
                href="/my-webinars"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/my-webinars" ? styles.active : ""}`}
              >
                My Webinars
              </Link>

               <Link
                href="/edit-profile"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/edit-profile" ? styles.active : ""}`}
              >
                Edit Profile
              </Link>

               <Link
                href="/forget-password"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${pathname === "/forget-password" ? styles.active : ""}`}
              >
                Change Password
              </Link>
            </>
          )}

          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <div className={styles.mobileUser}>
                  <div className={styles.avatar}>
                    {user.firstName?.charAt(0).toUpperCase()}
                    {user.lastName?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.firstName} {user.lastName}</span>
                </div>

                <button
                  className="btn btnghost"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className={styles.mobileAuthBtns}>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btnghost"
                >
                  Login
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="btn btnprimary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  )
}

export default Header