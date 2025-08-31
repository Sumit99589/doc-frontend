import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key only on server
);

export async function POST() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = sessionClaims?.email;

  // check if user already exists
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!data) {
    // insert into users table
    const { error: insertError } = await supabase.from("users").insert({
      clerk_id: userId,
      email,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // create a folder for this user in storage (empty file trick)
    await supabase.storage
      .from("client-documents")
      .upload(`${userId}/.init`, new Blob(["init"]), { upsert: true });
  }

  return NextResponse.json({ success: true });
}
