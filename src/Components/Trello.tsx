import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { trelloVal } from "../libs/validation";
import { TrelloReq } from "../libs/typs";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../libs/Api";

interface TrelloModalProps {
  open: boolean;
  onClose: () => void;
}

export const TrelloModal = ({ open, onClose }: TrelloModalProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TrelloReq>({
    defaultValues: {
      board_name: "",
      list_name: "",
    },
    resolver: yupResolver(trelloVal),
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: TrelloReq) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await axios.post(
        `${BASE_URL}/extract_and_add_tasks/`,
        data
      );
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setResult(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white font-bold flex items-center gap-2 py-4 px-6 ">
        Add Extracted Tasks to Trello
      </DialogTitle>

      <DialogContent
        dividers
        className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white p-6 md:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label htmlFor="board_name" className="font-medium mb-1 block">
              Board Name
            </label>
            <Controller
              name="board_name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder=" My Project Board"
                  id="board_name"
                  className="w-full px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.board_name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.board_name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="list_name" className="font-medium mb-1 block">
              List Name
            </label>
            <Controller
              name="list_name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="List Name"
                  id="list_name"
                  className="w-full px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.list_name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.list_name.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-600 p-4 rounded-lg">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-600 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-2">✅ Tasks Added:</h4>
              <ul className="list-disc ml-5 space-y-1">
                {result.tasks.map((task: any, idx: number) => (
                  <li key={idx}>
                    <a
                      href={task.card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {task.task}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <Box sx={{ mt: 4 }} className="flex justify-end gap-3">
          <Button onClick={handleClose} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Submitting..." : "Add"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
