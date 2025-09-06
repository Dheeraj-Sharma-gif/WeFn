"use client";
import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../actions/auth"; 
import { useDispatch } from "react-redux";
import { login } from "../redux/authslice"; 
import { useRouter } from "next/navigation";

export default function MyComponent() {
  const [mode, setMode] = useState("login");  
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
    setError("");
    setSuccess("");
    setForm({ email: "", password: "", name: "" });
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        const res = await loginUser(form); 
        if (res.error) setError(res.error);
        else {
          dispatch(login(res.token));
          setSuccess("Login successful!");
          router.push("/dashboard");
        }
      } else {
        const res = await registerUser(form);
        if (res.error) setError(res.error);
        else {
          dispatch(login(res.token));
          setSuccess("Registration successful!");
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-900">
        {/* Toggle Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === "login"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === "register"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (optional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-900 border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-900 border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-900 border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
