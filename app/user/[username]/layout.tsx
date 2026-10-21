import type { Metadata } from "next";
import type { ReactNode } from "react";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> => {
  const { username } = await params;
  return {
    title: "FlagForge User Profile",
    description:
      "View FlagForge user profiles with CTF rank, badges, and cybersecurity achievements.",
    alternates: {
      canonical: `/user/${username}`,
    },
    openGraph: {
      title: "FlagForge User Profile",
      description:
        "View FlagForge user profiles with CTF rank, badges, and cybersecurity achievements.",
      url: `https://flagforgectf.com/user/${username}`,
      type: "profile",
      siteName: "FlagForge",
    },
    twitter: {
      card: "summary",
      title: "FlagForge User Profile",
      description:
        "View FlagForge user profiles with CTF rank, badges, and cybersecurity achievements.",
    },
  };
};

export default function PublicUserLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
