"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import { useSession } from "next-auth/react";

const ProfilePage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{
    image?: string;
    name?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/auth/session`);
          const sessionData = await res.json();
          setUser(sessionData.user);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
      setLoading(false);
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  // Handle loading and session checks
  if (loading || sessionStatus === "loading") {
    return <Loading />;
  }

  if (sessionStatus === "unauthenticated") {
    return <AuthError />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-3xl w-full bg-gray-800 shadow-lg rounded-2xl p-6">
        <div className="flex flex-col items-center">
          <Image
            src={user?.image || "/default-profile.png"}
            alt={user?.name || "Profile Picture"}
            width={150}
            height={150}
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
          <h1 className="text-3xl font-bold mt-4">
            Welcome, {user?.name || "User"}!
          </h1>
          <p className="text-gray-400 mt-2">
            Email: {user?.email || "Not available"}
          </p>
          <p className="text-green-400 mt-2 text-lg">[0x10] [SAGE]</p>
        </div>

        {/* Profile Stats */}
        <div className="mt-6 flex justify-around">
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400">Rank</h2>
            <p className="text-lg">694</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400">Badges</h2>
            <p className="text-lg">33</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400">Streak</h2>
            <p className="text-lg">9</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400">Completed</h2>
            <p className="text-lg">431</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
