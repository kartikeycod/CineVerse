import { getStorage } from "firebase/storage";
import { app } from "./config";

// 🔴 FORCE THE CORRECT BUCKET
export const storage = getStorage(
  app,
  "gs://movie-admin-panel-56c60.appspot.com"
);
