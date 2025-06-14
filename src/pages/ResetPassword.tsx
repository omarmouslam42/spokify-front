import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [isSowPass, setIsSowPass] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
  const toggelPass = () => {
    setIsSowPass(!isSowPass);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError(false);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/auth/reset-password",
        {
          token,
          newPassword: password,
        }
      );
      setMsg(res.data.message);
    } catch (err: any) {
      setError(true);
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl w-full max-w-xl p-8 md:p-10">
         <ArrowLeft
          className="cursor-pointer"
          onClick={() => navigate("/login")}
          color="white"
        />
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Reset Your Password
        </h2>``

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2 relative">
            <label className="text-purple-100 font-medium">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={isSowPass ? "text" : "password"}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
            <div
              className="absolute end-0 top-10 right-4 text-purple-500 cursor-pointer"
              onClick={toggelPass}
            >
              {isSowPass ? (
                <EyeOff className="w-6 h-6" />
              ) : (
                <Eye className="w-6 h-6" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold transition-all duration-150"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <div
            className={`mt-6 text-center px-4 py-3 rounded-lg text-sm font-medium ${
              error
                ? "bg-red-500/20 text-red-300"
                : "bg-green-500/20 text-green-300"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
