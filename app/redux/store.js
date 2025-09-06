import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice.js";
import widgetsReducer from './widgetslice.js'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    widgets: widgetsReducer
  },
});
