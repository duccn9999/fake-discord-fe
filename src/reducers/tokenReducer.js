import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
};

export const tokenSlice = createSlice({
  name: "tokenSlice",
  initialState,
  reducers: {
    save: (state, action) => {
      state.value = action.payload;
    },
    clear: (state) => {
      state.value = null;
    },
  },
});

export const { save, clear } = tokenSlice.actions;
export default tokenSlice.reducer;
