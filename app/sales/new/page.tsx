import Link from "next/link";
import { getSaleCreationOptions } from "@/app/actions/sales";
import { requireSalesManager } from "@/utils/supabase/sales-access";
import SaleForm from "./SaleForm";

export default async function NewSalePage() {
  await requireSalesManager();
  const { customers, products } = await getSaleCreationOptions();

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/sales">
        ← All sales
      </Link>
      <p className="eyebrow">Sales</p>
      <h1>Create a sale</h1>
      <p className="intro">
        Select a customer and add products to create a transaction.
      </p>
      <SaleForm customers={customers} products={products} />
    </main>
  );
}
