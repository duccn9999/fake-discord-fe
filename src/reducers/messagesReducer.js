import { createSlice } from "@reduxjs/toolkit";

export const initialState = { data: [] };
export const messagesSlice = createSlice({
  name: "messagesSlice",
  initialState,
  reducers: {
    GET_MESSAGES: (state, action) => {
      state.value = action.payload;
    },
    GET_MESSAGES_PAGINATION: (state, action) => {
      const combinedMessages = [...state.value, ...action.payload];

      // Ensuring uniqueness based on a specific property, e.g., 'id'
      state.value = combinedMessages.filter(
        (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
      );
    },

    ADD_MESSAGE: (state, action) => {
      state.value.push(action.payload);
    },
    UPDATE_MESSAGE: (state, action) => {
      const index = state.value.findIndex(
        (msg) => msg.id === action.payload.id
      );
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload }; // Update message
      }
    },
    DELETE_MESSAGE: (state, action) => {
      state.value = state.value.filter((msg) => msg.id !== action.payload); // Remove message by ID
    },
  },
});
export const {
  GET_MESSAGES,
  GET_MESSAGES_PAGINATION,
  ADD_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
} = messagesSlice.actions;
export default messagesSlice.reducer;
