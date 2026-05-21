"use client";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import UserDashboard from "@/components/UserDashboard/UserDashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
  <>
  <Header />
  <UserDashboard />
  <Footer />
  </> 
  )
}