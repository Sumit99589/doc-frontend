"use client";
import { useState } from "react";
import { Button } from "./ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AddClient from "./ui/addClient";

export default function Sidebar(){
    const [activeTab, setActiveTab] = useState("Clients");

    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");


    return (
        <div>
            <aside className="w-64 p-6 flex flex-col min-h-screen">
        <h1 className="text-xl font-bold mb-8">Acme Co</h1>
        <nav className="flex flex-col gap-4">
          <button
            className={`flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#293238] p-1 rounded rounded-sm${
              activeTab === "Dashboard" ? "text-white font-semibold bg-[#293238]" : ""
            }`}
            onClick={() => setActiveTab("Dashboard")}
          >
            🏠 Dashboard
          </button>
          <button
            className={`flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#293238] p-1 rounded rounded-sm${
              activeTab === "Clients" ? "text-white font-semibold bg-[#293238]" : ""
            }`}
            onClick={() => setActiveTab("Clients")}
          >
            👥 Clients
          </button>
          <button
            className={`flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#293238] p-1 rounded rounded-sm${
              activeTab === "Analytics" ? "text-white font-semibold bg-[#293238]" : ""
            }`}
            onClick={() => setActiveTab("Analytics")}
          >
             Storage
          </button>
          <button
            className={`flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#293238] p-1 rounded rounded-sm${
              activeTab === "Settings" ? "text-white font-semibold bg-[#293238]" : ""
            }`}
            onClick={() => setActiveTab("Settings")}
          >
            ⚙️ Settings
          </button>
          <AddClient></AddClient>              
        </nav>
      </aside>
        </div>
    )
}