import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2, AudioWaveform as Waveform } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { LoginRegister } from "../libs/validation";
import { Eye, EyeOff } from "lucide-react";
import { LoginInputs } from "../libs/typs";
import { useAuthStore } from "../store/aurhStore";

export const Login = () => {
  const [isSowPass, setIsShowPass] = useState<Boolean>(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(LoginRegister),
  });
  const { login, isLoading, error, clearError } = useAuthStore();
  const toggelPass = (): void => {
    setIsShowPass(!isSowPass);
  };

  const onSubmit = async (data: LoginInputs) => {
    await login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white/5 backdrop-blur-xl shadow-xl border border-white/10 rounded-3xl w-full max-w-2xl p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-60 animate-ping"></div>
              <Waveform className="w-12 h-12 text-white relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              SPOKIFY
            </h1>
          </div>
          <p className="text-purple-100 text-lg">
            Log in to access your transcriptions
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-white text-3xl font-bold text-center mb-6">
            Login
          </h2>

          <div className="space-y-2">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-purple-100 font-medium">Email</label>
                  <input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearError();
                    }}
                    type="email"
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm pt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2 relative">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <div className="space-y-2 relative">
                  <label className="text-purple-100 font-medium">
                    Password
                  </label>
                  <input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearError();
                    }}
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
                  {errors.password && (
                    <p className="text-red-300 text-sm pt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
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
          {error && (
            <p className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-center">
              {error}
            </p>
          )}
          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-800/30 transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              "Login"
            )}
          </button>

          <div className="flex flex-col items-center">
            <Link
              to={"/forgot-password"}
              className="text-purple-400 underline hover:text-purple-300"
            >
              Forgot Password ?
            </Link>
          </div>

          <p className="text-purple-200 text-sm text-center">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-purple-400 underline hover:text-purple-300"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
