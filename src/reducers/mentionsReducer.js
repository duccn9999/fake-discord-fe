import { createSlice } from "@reduxjs/toolkit";

export const initialState = { value: {} };

export const mentionsCountSlice = createSlice({
  name: "mentionsCountSlice",
  initialState,
  reducers: {
    SET_MENTION_COUNT: (state, action) => {
      const { channelId, mentionsCount } = action.payload;
      state.value[channelId] = mentionsCount;
    },
    CLEAR_MENTION_COUNT: (state, action) => {
      const channelId = action.payload;
      delete state.value[channelId];
    },
  },
});

export const { SET_MENTION_COUNT, CLEAR_MENTION_COUNT } = mentionsCountSlice.actions;
export default mentionsCountSlice.reducer;
