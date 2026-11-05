"use client";

import Link from "next/link";
import { createSaleTransaction } from "@/app/actions/sales";
import type { SaleCustomerOption } from "@/app/actions/sales";
import type { ProductRow } from "@/utils/supabase/database.types";
import { useState, useTransition } from "react";

type SaleProductOption = Pick<
  ProductRow,
  "id" | "name" | "sku" | "unit_price"
>;

type SaleFormProps = {
  customers: SaleCustomerOption[];
  products: SaleProductOption[];
};

type DraftItem = {
  productId: string;
  quantity: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function SaleForm({ customers, products }: SaleFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { productId: "", quantity: "1" },
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedProducts = items.map((item) =>
    products.find((product) => product.id === item.productId),
  );
  const grandTotal = items.reduce((total, item, index) => {
    const quantity = Number(item.quantity);
    const product = selectedProducts[index];
    return total +
      (product &&
      Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      quantity <= 2_147_483_647
        ? product.unit_price * quantity
        : 0);
  }, 0);
  const canSubmit =
    customers.length > 0 &&
    products.length > 0 &&
    Boolean(customerId) &&
    items.length > 0 &&
    items.every(
      (item) =>
        Boolean(item.productId) &&
        Number.isSafeInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        Number(item.quantity) <= 2_147_483_647 &&
        products.some((product) => product.id === item.productId),
    );

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setErrorMessage("");
  }

  function submitSale() {
    if (!canSubmit) {
      setErrorMessage("Choose a customer, a product, and a valid quantity for each line.");
      return;
    }

    const saleItems = items.flatMap((item) => {
      const product = products.find((option) => option.id === item.productId);
      return product
        ? [
            {
              productId: product.id,
              quantity: Number(item.quantity),
              unitPrice: product.unit_price,
            },
          ]
        : [];
    });

    setErrorMessage("");
    startTransition(async () => {
      try {
        await createSaleTransaction(customerId, saleItems);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The sale could not be created. Please try again.",
        );
      }
    });
  }

  return (
    <section className="sales-form">
      {customers.length === 0 && (
        <p className="form-message form-error" role="status">
          There are no active customers available. Add or activate a customer first.
        </p>
      )}
      {products.length === 0 && (
        <p className="form-message form-error" role="status">
          There are no active products available. Add or activate a product first.
        </p>
      )}

      <label className="sales-field">
        Customer
        <select
          required
          value={customerId}
          onChange={(event) => {
            setCustomerId(event.target.value);
            setErrorMessage("");
          }}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.email}
            </option>
          ))}
        </select>
      </label>

      <div className="sales-items">
        <div className="sales-items-heading">
          <div>
            <h2>Line items</h2>
            <p className="intro">Prices are verified against the current catalog.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            disabled={items.length >= Math.min(products.length, 100) || isPending}
            onClick={() => {
              setItems((current) => [...current, { productId: "", quantity: "1" }]);
              setErrorMessage("");
            }}
          >
            Add item
          </button>
        </div>

        {items.map((item, index) => {
          const product = selectedProducts[index];
          const quantity = Number(item.quantity);
          const subtotal =
            product && Number.isSafeInteger(quantity) && quantity > 0
              ? product.unit_price * quantity
              : 0;

          return (
            <div className="sales-line-item" key={index}>
              <label className="sales-field">
                Product
                <select
                  required
                  value={item.productId}
                  onChange={(event) =>
                    updateItem(index, { productId: event.target.value })
                  }
                >
                  <option value="">Select a product</option>
                  {products
                    .filter(
                      (option) =>
                        option.id === item.productId ||
                        !items.some((selected) => selected.productId === option.id),
                    )
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} ({option.sku}) · {currency.format(option.unit_price)}
                      </option>
                    ))}
                </select>
              </label>
              <label className="sales-field">
                Quantity
                <input
                  type="number"
                  min="1"
                  max="2147483647"
                  step="1"
                  required
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, { quantity: event.target.value })
                  }
                />
              </label>
              <div className="sales-subtotal">
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <button
                className="sales-remove-button"
                type="button"
                aria-label={`Remove line item ${index + 1}`}
                disabled={items.length === 1 || isPending}
                onClick={() => {
                  setItems((current) => current.filter((_, i) => i !== index));
                  setErrorMessage("");
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="sales-total">
        <span>Order total</span>
        <strong>{currency.format(grandTotal)}</strong>
      </div>

      {errorMessage && (
        <p className="form-message form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="hrm-actions">
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={submitSale}
        >
          {isPending ? "Creating sale…" : "Create sale"}
        </button>
        <Link className="link-button secondary-button" href="/sales">
          Cancel
        </Link>
      </div>
    </section>
  );
}
