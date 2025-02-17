import { createSlice } from "@reduxjs/toolkit";

export const initialState = { data: [] };
export const channelsSlice = createSlice({
  name: "channelsSlice",
  initialState,
  reducers: {
    GET_CHANNELS: (state, action) => {
      state.value = action.payload;
    },
    ADD_CHANNEL: (state, action) => {
      state.value.push(action.payload);
    },
    UPDATE_CHANNEL: (state, action) => {
      const index = state.value.findIndex(
        (msg) => msg.messageId === action.payload.messageId
      );
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload };
      }
    },
    DELETE_CHANNEL: (state, action) => {
      state.value = state.value.filter(
        (msg) => msg.messageId !== action.payload.messageId
      );
    },
  },
});
export const { GET_CHANNELS, ADD_CHANNEL, UPDATE_CHANNEL, DELETE_CHANNEL } = channelsSlice.actions;
export default channelsSlice.reducer;
