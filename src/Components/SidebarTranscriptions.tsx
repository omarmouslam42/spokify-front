import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import axios from "axios";
import { back_URL } from "../libs/Api";

export const SidebarTranscriptions = forwardRef(
  ({ userId, onSelect }: any, ref) => {
    const [transcriptions, setTranscriptions] = useState([]);

    const fetchTranscriptions = async () => {
      try {
        const res = await axios.get(
          `${back_URL}/api/transcriptions/user/${userId}`
        );
        console.log(res);

        setTranscriptions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch transcriptions", error);
      }
    };

    useEffect(() => {
      fetchTranscriptions();
    }, [userId]);

    // 👇 ده بيخلي `ref.current.refresh()` شغال
    useImperativeHandle(ref, () => ({
      refresh: fetchTranscriptions,
    }));

    return (
      <div className="bg-white/10 p-4 rounded-lg shadow-md h-screen">
        <h3 className="text-white font-semibold mb-3">My Transcriptions :</h3>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {transcriptions.map((item: any) => (
            <li
              key={item._id}
              onClick={() => onSelect(item)}
              className="cursor-pointer text-white hover:underline"
            >
              {item.audio?.filename || "Untitled"}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);
