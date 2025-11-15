import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:4000" });
export const searchEmails = (q?: string, account?: string, folder?: string) =>
  API.get("/emails", { params: { q, account, folder } }).then(r => r.data);

export const suggestReply = (emailText: string) => API.post("/suggest", { emailText }).then(r => r.data);
