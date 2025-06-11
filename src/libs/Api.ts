import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

// 1. رفع الملف وتفريغه
export const transcribeAudioToText = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(`${BASE_URL}/transcribe`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log(data);

  return data;
};

// 2. تلخيص النص
export const getSummary = async () => {
  const { data } = await axios.get(`${BASE_URL}/summarize/`);
  console.log(data);
  
  return data;
};

// 3. تحسين النص
export const getEnhancedText = async () => {
  const { data } = await axios.get(`${BASE_URL}/enhance/`);
  console.log(data);
  
  return data;
};

// 4. استخراج المواضيع
export const getTopics = async () => {
  const { data } = await axios.get(`${BASE_URL}/detect_topics/`);
  return data;
};

// 5. استخراج المهام
export const getTasks = async () => {
  const { data } = await axios.get(`${BASE_URL}/extract_tasks/`);
  return data;
};

// 6. إرسال المهام لـ Trello
export const addTasksToTrello = async (
  board_name: string,
  list_name: string
) => {
  const { data } = await axios.post(`${BASE_URL}/extract_and_add_tasks/`, {
    board_name,
    list_name,
  });

  return data;
};
