import api from "./api";

const PasswordResetService = {

  forgotPassword: async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post(
      "/auth/reset-password",
      {
        token,
        newPassword
      }
    );

    return response.data;
  }

};

export default PasswordResetService;