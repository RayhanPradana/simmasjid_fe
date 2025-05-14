// /lib/auth.js
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useAuthRedirect() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push("/login");
    }
  }, [isLoggedIn]);

  return isLoggedIn; // true, false, atau null (loading)
}
