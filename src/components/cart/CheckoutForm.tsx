"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitCheckoutAction, type CheckoutActionState } from "@/app/checkout/actions";

const initialState: CheckoutActionState = {};

export function CheckoutForm() {
  const [state, formAction] = useFormState(submitCheckoutAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p role="alert" className="rounded-card bg-sale/10 p-3 text-sm text-sale">
          {state.error}
        </p>
      )}

      <Field label="Ім'я" name="customerName" error={state.fieldErrors?.customerName} required />
      <Field label="Номер телефону" name="customerPhone" type="tel" error={state.fieldErrors?.customerPhone} required />
      <Field label="Email (необов'язково)" name="customerEmail" type="email" error={state.fieldErrors?.customerEmail} />
      <Field label="Місто" name="city" error={state.fieldErrors?.city} required />
      <Field
        label="Відділення або поштомат Нової Пошти"
        name="warehouse"
        error={state.fieldErrors?.warehouse}
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="shippingMethod">
          Спосіб доставки
        </label>
        <select id="shippingMethod" name="shippingMethod" className="h-12 w-full rounded-card border border-line px-3">
          <option value="NOVA_POSHTA_BRANCH">Нова Пошта - відділення</option>
          <option value="NOVA_POSHTA_POSTOMAT">Нова Пошта - поштомат</option>
          <option value="COURIER">Кур'єр</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="paymentMethod">
          Спосіб оплати
        </label>
        <select id="paymentMethod" name="paymentMethod" className="h-12 w-full rounded-card border border-line px-3">
          <option value="CASH_ON_DELIVERY">Оплата при отриманні</option>
          <option value="ONLINE">Онлайн-оплата (додається пізніше)</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="comment">
          Коментар до замовлення
        </label>
        <textarea id="comment" name="comment" rows={3} className="w-full rounded-card border border-line p-3" />
      </div>

      <SubmitButton />
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="h-12 w-full rounded-card border border-line px-3"
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-sale">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-card bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-50"
    >
      {pending ? "Оформлюємо..." : "Підтвердити замовлення"}
    </button>
  );
}
