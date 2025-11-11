import axiosClient from "./axiosClient";
import { UserLogin} from "../types/auth";

const authApi = {
  login: (data: UserLogin) =>
    axiosClient.post("users/login", data),
  getProfile: () => axiosClient.get("/auth/me"),
};

export default authApi;
