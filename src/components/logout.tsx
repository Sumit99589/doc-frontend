"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function Logout() {
  return (
    <SignOutButton>
      <button className="px-4 py-2 rounded-md bg-red-500 text-white">
        Log out
      </button>
    </SignOutButton>
  );
}
