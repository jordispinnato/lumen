import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

async function markRowsRead(dataSupabase, table, userId) {
  await dataSupabase
    .from(table)
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

function buildReceipts(rows, userId, itemType) {
  return (rows || [])
    .filter((item) => !item.read_at)
    .map((item) => ({
      user_id: userId,
      item_type: itemType,
      item_id: item.id,
      read_at: new Date().toISOString(),
    }));
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const userId = userData.user.id;
  const dataSupabase = createSupabaseAdminClient() || supabase;
  const [{ data: notifications }, { data: messages }] = await Promise.all([
    dataSupabase
      .from("user_notifications")
      .select("id,user_id,read_at")
      .or(`user_id.eq.${userId},user_id.is.null`),
    dataSupabase
      .from("user_messages")
      .select("id,user_id,read_at")
      .or(`user_id.eq.${userId},user_id.is.null`),
  ]);

  await Promise.all([
    markRowsRead(dataSupabase, "user_notifications", userId),
    markRowsRead(dataSupabase, "user_messages", userId),
  ]);

  const receipts = [
    ...buildReceipts(notifications, userId, "notification"),
    ...buildReceipts(messages, userId, "message"),
  ];

  if (receipts.length) {
    const { error } = await dataSupabase
      .from("user_notification_reads")
      .upsert(receipts, { onConflict: "user_id,item_type,item_id" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
