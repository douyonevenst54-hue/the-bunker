const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkCredentials(body: { email?: unknown; password?: unknown }):
  | { email: string; password: string }
  | { error: "errEmail" | "errPassword" } {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!EMAIL.test(email) || email.length > 200) return { error: "errEmail" };
  if (password.length < 8 || password.length > 200) return { error: "errPassword" };
  return { email, password };
}
