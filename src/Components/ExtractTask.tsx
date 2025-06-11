import { Loading } from "./Loading";

interface ExtractResult {
  text: string;
  isLoading: boolean;
  hidden: boolean;
}
export const ExtractTask = ({ task }: { task: ExtractResult }) => {
  return (
    <div className="mt-10 px-4">
      <hr className="border-white/20" />
      <h3 className="text-white mt-4 font-bold text-2xl tracking-wide">
        Extract Tasks:
      </h3>

      <div className="mt-4">
        {task.isLoading ? (
          <Loading />
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 shadow-lg backdrop-blur-md ">
            <h4 className="text-white text-lg font-semibold">
              {task?.text}
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};
