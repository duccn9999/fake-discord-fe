import { createSlice } from "@reduxjs/toolkit";
export const initialState = { value: [] };
export const notificationsSlice = createSlice({
  name: "notificationsSlice",
  initialState,
  reducers: {
    GET_NOTIFICATIONS: (state, action) => {
      state.value = action.payload;
    },
    ADD_NOTIFICATION: (state, action) => {
      state.value.push(action.payload);
    },
    UPDATE_NOTIFICATION: (state, action) => {
      const index = state.value.findIndex(
        (notification) => notification.notificationId === action.payload.notificationId
      );
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload };
      }
    },
  },
});
export const { GET_NOTIFICATIONS, ADD_NOTIFICATION, UPDATE_NOTIFICATION } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
