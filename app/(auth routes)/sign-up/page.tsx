"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./SignUpPage.module.css";
export default function SignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: register });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const user = await mutation.mutateAsync({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      await queryClient.cancelQueries();
      queryClient.clear();
      useAuthStore.getState().setUser(user);
      router.push("/profile");
      router.refresh();
    } catch {
      setError(
        "Unable to register. Check your details or try a different email.",
      );
    }
  }
  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={submit}>
        <h1 className={css.formTitle}>Sign up</h1>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            autoComplete="email"
            required
            disabled={mutation.isPending}
          />
        </div>
        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            autoComplete="new-password"
            minLength={6}
            required
            disabled={mutation.isPending}
          />
        </div>
        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Please wait..." : "Register"}
          </button>
        </div>
        {error && (
          <p className={css.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
