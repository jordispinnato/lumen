import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export async function GET(request, { params }) {
  const origin = new URL(request.url).origin;
  const { orderId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  const { data: order, error } = await supabase
    .from("catalog_orders")
    .select(`
      id,
      status,
      user_id,
      product_type,
      catalog_products:product_id (
        title,
        product_type,
        digital_url,
        digital_file_path
      )
    `)
    .eq("id", orderId)
    .eq("user_id", userData.user.id)
    .eq("product_type", "digital")
    .in("status", ["paid", "delivered"])
    .maybeSingle();

  if (error || !order) {
    return NextResponse.redirect(`${origin}/mis-recursos`, { status: 303 });
  }

  if (order.catalog_products?.digital_url) {
    return NextResponse.redirect(order.catalog_products.digital_url, { status: 303 });
  }

  if (!order.catalog_products?.digital_file_path) {
    return NextResponse.redirect(`${origin}/mis-recursos`, { status: 303 });
  }

  const storageSupabase = createSupabaseAdminClient() || supabase;
  const { data: signed, error: signedError } = await storageSupabase.storage
    .from("catalog-digital-files")
    .createSignedUrl(order.catalog_products.digital_file_path, 60 * 10);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.redirect(`${origin}/mis-recursos`, { status: 303 });
  }

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
