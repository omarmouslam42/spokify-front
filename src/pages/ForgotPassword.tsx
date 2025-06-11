import { useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage(null);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/auth/forgot-password",
        { email }
      );

      const data = res.data;

      setMessage({ type: "success", text: data.message || "Reset link sent!" });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Something went wrong";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white/5 backdrop-blur-xl shadow-xl border border-white/10 rounded-3xl w-full max-w-2xl p-10">
        <h1 className="text-white text-3xl font-bold mb-6 text-center">
          Reset Your Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all flex justify-center items-center gap-2"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isSending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-6 text-center font-semibold ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};
