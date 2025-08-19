"use client";
import { useState } from "react";
import { Button } from "./button";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";


export default function AddClient() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false); // 👈 dialog state

  async function handleInput() {
    try {
      const res = await fetch("http://localhost:3000/add-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientName: company, email: email }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Client added:", data);
        setCompany("");
        setEmail("");
        setOpen(false); // 👈 close dialog after success
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  }

  return (
    <div>
        
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Trigger button */}
        <DialogTrigger asChild>
          <Button
            variant={"secondary"}
            className="cursor-pointer absolute bottom-0 mb-10 px-12 bg-[#47A9EB] hover:bg-blue-500"
          >
            Add new Client
          </Button>
        </DialogTrigger>

        {/* Actual dialog */}
        <DialogContent className="sm:max-w-md rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Add Client Details
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Please enter the client’s information below.
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <Input
                placeholder="e.g. OpenAI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-lg border-gray-300 focus:border-[#47A9EB] focus:ring-[#47A9EB] text-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                placeholder="e.g. contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-gray-300 focus:border-[#47A9EB] focus:ring-[#47A9EB] text-black"
              />
            </div>

            <Button
              onClick={handleInput}
              className="w-full mt-2 bg-[#47A9EB] hover:bg-blue-500 text-white rounded-lg"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
