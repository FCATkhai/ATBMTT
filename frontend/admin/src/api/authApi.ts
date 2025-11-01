import axiosClient from "./axiosClient";
import { UserLogin, UserSignUp } from "../types/auth";

const authApi = {
  signUp: (data: UserSignUp) => axiosClient.post("/users/register", JSON.stringify(data)),
  login: (data: UserLogin) =>
    axiosClient.post("/users/login", JSON.stringify(data)),
  getProfile: () => axiosClient.get("/auth/me"),
};

export default authApi;
