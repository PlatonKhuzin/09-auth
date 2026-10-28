"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./EditProfilePage.module.css";
export default function EditProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: ({ signal }) => getMe(signal),
    enabled: !user,
    retry: false,
  });
  const currentUser = user ?? query.data;
  const mutation = useMutation({ mutationFn: updateMe });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    if (!username) {
      setError("Username is required.");
      return;
    }
    setError("");
    try {
      const updated = await mutation.mutateAsync({ username });
      await queryClient.cancelQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["auth"] });
      setUser(updated);
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Could not save your profile. Please try again.");
    }
  }
  if (!currentUser)
    return (
      <main className={css.mainContent}>
        <p>
          {query.isError
            ? "Could not load your profile."
            : "Loading profile..."}
        </p>
      </main>
    );
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>
        <Image
          src={currentUser.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />
        <form className={css.profileInfo} onSubmit={submit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              className={css.input}
              defaultValue={currentUser.username}
              required
              disabled={mutation.isPending}
            />
          </div>
          <p>Email: {currentUser.email}</p>
          {error && <p role="alert">{error}</p>}
          <div className={css.actions}>
            <button
              type="submit"
              className={css.saveButton}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.push("/profile")}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
