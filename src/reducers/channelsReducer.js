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
  },
});
export const { GET_CHANNELS, ADD_CHANNEL } = channelsSlice.actions;
export default channelsSlice.reducer;
