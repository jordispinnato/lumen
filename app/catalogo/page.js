import CatalogFilters from "./CatalogFilters";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { demoProducts } from "../../lib/catalog";

export const metadata = {
  title: "Catalogo online | LUMEN",
  description: "Productos fisicos y recursos digitales para bienestar, educacion y practica clinica.",
};

export default async function CatalogoPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("catalog_products")
    .select("id,title,product_type,category,summary,price,stock,digital_url,digital_file_name,status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const products = data?.length ? data : demoProducts;

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Catalogo online</p>
          <h1>Recursos fisicos y digitales para acompanar procesos.</h1>
          <p className="lead">
            Fidgets sensoriales, materiales de regulacion, recursos terapeuticos y cuadernillos descargables.
          </p>
        </div>

        <CatalogFilters products={products} />
      </div>
    </main>
  );
}
