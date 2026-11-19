import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { api, errorOf, saveToken, type User } from "../api/client";

export function SignIn() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const response = await api.post<{ token: string; user: User }>(
        "/auth/login",
        { email: form.get("email"), password: form.get("password") },
      );
      saveToken(response.data.token);
      await client.invalidateQueries();
      await navigate("/");
    } catch (failure) {
      setError(errorOf(failure));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1>Sign in</h1>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          Email <input name="email" type="email" required />
        </label>
        <label>
          Password <input name="password" type="password" required />
        </label>
        <button type="submit" disabled={pending}>
          Sign in
        </button>
      </form>
      {error !== null && <p role="alert">{error}</p>}
    </>
  );
}
