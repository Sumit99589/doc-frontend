"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import RequestDocumentsDialog from "./reqDoc";

const clients = [
  {
    name: "Tech Solutions Inc.",
    email: "contact@techsolutions.com",
    status: "Active",
    lastActivity: "2023-08-15",
  },
  {
    name: "Global Innovations Ltd.",
    email: "info@globalinnovations.com",
    status: "Inactive",
    lastActivity: "2023-07-22",
  },
  {
    name: "Creative Designs Co.",
    email: "support@creativedesigns.com",
    status: "Active",
    lastActivity: "2023-09-01",
  },
  {
    name: "Strategic Ventures LLC",
    email: "admin@strategicventures.com",
    status: "Active",
    lastActivity: "2023-08-28",
  },
  {
    name: "Dynamic Systems Corp.",
    email: "sales@dynamicsystems.com",
    status: "Inactive",
    lastActivity: "2023-07-10",
  },
];

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);

useEffect(() => {
  async function fetchClients() {
    try {
      const res = await fetch("http://localhost:3000/getClients");
      const data: { clients: any[] } = await res.json(); // ✅ await + type
      setClients(data.clients || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  }
  fetchClients();
}, []);


  return (
    <div className="flex text-white">
    
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Clients</h2>

        <Card className=" border border-gray-700 bg-[#111518] text-white">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="">
                  <th className="p-4 ">Client</th>
                  <th className="p-4 ">Email</th>
                  <th className="p-4 ">status</th>
                  <th className="p-4 ">Action</th>

                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => (
                  <tr key={i} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">{client.company}</td>
                    <td className="p-4 text-[#47A9EB]">{client.email}</td>
                    <td className="p-4 text-[#47A9EB]">{client.status}</td>
                    <td className="p-4 text-blue-400 cursor-pointer hover:underline">
                      {/* <Button className="bg-green-600 hover:bg-green-900 cursor-pointer">Request Documents</Button> */}
                      <RequestDocumentsDialog />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
