"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "../../lib/courses";
import { getProductTypeLabel } from "../../lib/catalog";

const filters = [
  { value: "all", label: "Todos" },
  { value: "physical", label: "Físicos" },
  { value: "digital", label: "Digitales" },
];

export default function CatalogFilters({ products }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    return products.filter((product) => product.product_type === activeFilter);
  }, [activeFilter, products]);

  return (
    <>
      <div className="catalog-toolbar" aria-label="Filtros de catálogo">
        {filters.map((filter) => (
          <button
            className={`filter-chip ${activeFilter === filter.value ? "is-active" : ""}`}
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid catalog-grid">
        {filteredProducts.map((product) => (
          <article className="card product-card" key={product.id}>
            <div className={`product-type ${product.product_type}`}>
              {getProductTypeLabel(product.product_type)}
            </div>
            <p className="eyebrow">{product.category}</p>
            <h3>{product.title}</h3>
            <p>{product.summary}</p>
            {product.product_type === "physical" ? (
              <p className="muted">Stock: {product.stock ?? "A confirmar"}</p>
            ) : (
              <p className="muted">Entrega digital descargable</p>
            )}
            <p className="price">{formatPrice(product.price)}</p>
            <div className="actions">
              <Link className="button" href={`/catalogo/${product.id}`}>Ver producto</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
