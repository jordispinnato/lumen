export async function getCartQuantityTotal(supabase, userId) {
  const { data, error } = await supabase
    .from("catalog_cart_items")
    .select("quantity")
    .eq("user_id", userId);

  if (error) {
    console.error("getCartQuantityTotal:", error);
    return 0;
  }

  return (data || []).reduce((sum, item) => {
    const quantity = Number(item.quantity);
    return Number.isFinite(quantity) && quantity > 0 ? sum + quantity : sum;
  }, 0);
}
