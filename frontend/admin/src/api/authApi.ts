import axiosClient from "./axiosClient";
import { UserLogin, UserSignUp } from "../types/auth";

const authApi = {
  signUp: (data: UserSignUp) => axiosClient.post("/auth/signup", data),
  login: (data: UserLogin) =>
    axiosClient.post("/auth/login", data),
  getProfile: () => axiosClient.get("/auth/me"),
};

export default authApi;
