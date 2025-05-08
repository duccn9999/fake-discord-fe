import { createSlice } from "@reduxjs/toolkit";

export const initialState = { value: [] };
export const messagesSlice = createSlice({
  name: "messagesSlice",
  initialState,
  reducers: {
    GET_MESSAGES: (state, action) => {
      state.value = action.payload;
    },
    ADD_MESSAGE: (state, action) => {
      state.value = [...state.value, action.payload];
    },
    UPDATE_MESSAGE: (state, action) => {
      const index = state.value.findIndex(
        (msg) => msg.messageId === action.payload.messageId
      );
      console.log("index: ", index);
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload }; // Update only the specific message
      }
    },
    DELETE_MESSAGE: (state, action) => {
      state.value = state.value.filter(
        (msg) => msg.messageId !== action.payload.messageId
      ); // Remove message by ID
    },
  },
});
export const { GET_MESSAGES, ADD_MESSAGE, UPDATE_MESSAGE, DELETE_MESSAGE } =
  messagesSlice.actions;
export default messagesSlice.reducer;
