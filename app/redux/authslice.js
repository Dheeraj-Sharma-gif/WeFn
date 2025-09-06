import { createSlice } from "@reduxjs/toolkit";
import { deleteToken } from "../actions/auth";
const initialToken =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const initialState = {
  token: initialToken,
  isLoggedIn: !!initialToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem("token");
    },
  },
});


export const { login, logout } = authSlice.actions;



export const logoutUser = (token) => async (dispatch) => {
  try {
    if (token) {
      await deleteToken(token);  
    }
  } catch (err) {
    console.error("Failed to delete token from DB:", err);
  } finally {
    dispatch(logout());  
  }
};

export default authSlice.reducer;
