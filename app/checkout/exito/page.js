import { createSupabaseServerClient } from "../../../lib/supabase/server";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.order;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: order } = userData.user && isUuid(orderId)
    ? await supabase
        .from("orders")
        .select("status,courses:course_id (slug,title)")
        .eq("id", orderId)
        .eq("user_id", userData.user.id)
        .maybeSingle()
    : { data: null };
  const isApproved = order?.status === "approved";

  return (
    <main className="section">
      <div className="form-card">
        <p className="eyebrow">Pago recibido</p>
        <h1>{isApproved ? "Tu curso esta habilitado" : "Estamos confirmando tu pago"}</h1>
        <p className="muted">
          {isApproved
            ? `Ya podes entrar al aula y empezar ${order?.courses?.title || "tu curso"}.`
            : "Mercado Pago puede tardar unos minutos en avisarnos. Cuando se confirme, el curso aparece automaticamente en tu aula."}
        </p>
        <a className="button" href={order?.courses?.slug ? `/aula?curso=${order.courses.slug}` : "/aula"}>
          Ir al aula
        </a>
      </div>
    </main>
  );
}
