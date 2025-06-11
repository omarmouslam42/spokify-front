import { AudioWaveform as Waveform } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { RegisterSchema } from "../libs/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { RegisterInputs } from "../libs/typs";
import { useAuthStore } from "../store/aurhStore";
import { Loader2 } from "lucide-react";
export const Register = () => {
  const [isSowPass, setIsShowPass] = useState<Boolean>(false);
  const router = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInputs>({
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const toggelPass = (): void => {
    setIsShowPass(!isSowPass);
  };

  const onSubmit = async (data: RegisterInputs) => {
    const result = await registerUser(data);

    if (result && result.success) {
      router("/login");
    }
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
            Your voice, beautifully transcribed
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-white text-3xl font-bold text-center mb-6">
            Create Your Account
          </h2>

          <div className="space-y-2">
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-purple-100 font-medium">
                    Username
                  </label>
                  <input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearError();
                    }}
                    type="text"
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your username"
                  />
                  {errors.userName && (
                    <p className="text-red-300 text-sm pt-1">
                      {errors.userName.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Controller
              name="email"
              control={control}
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
              name="password"
              control={control}
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
            className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-800/30 transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              "Register"
            )}
          </button>
          <p className="text-purple-200 text-sm text-center pt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 underline hover:text-purple-300"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
