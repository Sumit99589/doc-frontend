"use client";
import { useUser } from "@clerk/nextjs";

import Dashboard from "@/components/Dashboard";
import { useEffect } from "react";
import LandingPage from "@/components/LandingPage";

export default function Home(){
	const { user } = useUser();
	 useEffect(() => {
    if (user) {
      fetch("http://localhost:3000/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id,
			name:user.fullName
		 }),
      });
    }
  }, [user]);
	return(
		<LandingPage></LandingPage>
	)
}

