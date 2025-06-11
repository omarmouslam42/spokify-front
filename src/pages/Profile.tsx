import {
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { RegisterSchema } from "../libs/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { RegisterInputs } from "../libs/typs";
import { useAuthStore } from "../store/aurhStore";

export const Profile = () => {
  const [isSowPass, setIsShowPass] = useState<boolean>(false);
  const {
    updateProfile,
    user,
    isLoading,
    error,
    clearError,
    logout,
    succesMessage,
  } = useAuthStore();

  const [imageBase64, setImageBase64] = useState<string | null>(
    user?.profileImage || null
  );

  console.log("user", user);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInputs>({
    defaultValues: {
      userName: user?.userName || "",
      email: user?.email || "",
      password: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggelPass = (): void => {
    setIsShowPass(!isSowPass);
  };

  const onSubmit = async (data: RegisterInputs) => {
    const finalData = {
      ...data,
      profileImage: imageBase64,
    };

    console.log(finalData);

    await updateProfile(finalData);
  };

  useEffect(() => {
    clearError();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/5 space-y-4 backdrop-blur-xl shadow-xl border border-white/10 rounded-3xl w-full max-w-2xl p-10"
      >
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            onClick={() => imageRef.current?.click()}
          >
            {imageBase64 ? (
              <img
                src={imageBase64}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.userName?.charAt(0).toUpperCase()
            )}
          </div>
          <input
            ref={imageRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Pencil className="text-white w-6 h-6" />
          <h2 className="text-white text-3xl font-bold">Edit Your Profile</h2>
        </div>

        <div className="space-y-2">
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <>
                <label className="text-purple-100 font-medium">Username</label>
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
              </>
            )}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <>
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
              </>
            )}
          />
        </div>

        {/* Password */}
        <div className="space-y-2 relative">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <>
                <label className="text-purple-100 font-medium">Password</label>
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
              </>
            )}
          />
        </div>

        {succesMessage && (
          <p className="text-green-500 px-4 text-center font-semibold">
            {succesMessage}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="bg-red-200 text-red-900 px-4 py-2 rounded-lg text-center font-semibold">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          disabled={isLoading}
          type="submit"
          className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-800/30 transition-all duration-200 hover:scale-105"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="block text-center mt-4 w-full py-3 rounded-xl bg-white/10 text-purple-300 hover:text-white hover:bg-purple-600 transition-all"
        >
          LogOut
        </button>
      </form>
    </div>
  );
};
