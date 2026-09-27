"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-semibold">Вхід в адмін-панель TovarkaDuck</h1>

      <form action={formAction} className="mt-6 space-y-4">
        {state.error && (
          <p role="alert" className="rounded-card bg-sale/10 p-3 text-sm text-sale">
            {state.error}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="h-12 w-full rounded-card border border-line px-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" required className="h-12 w-full rounded-card border border-line px-3" />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-12 w-full rounded-card bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-50">
      {pending ? "Вхід..." : "Увійти"}
    </button>
  );
}
