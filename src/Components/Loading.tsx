import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 shadow-lg backdrop-blur-md ">
      <Loader2 className="w-10 h-10 animate-spin text-center text-purple-300" />
    </div>
  );
};
