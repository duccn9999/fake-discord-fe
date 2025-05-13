import { createSlice } from "@reduxjs/toolkit";
export const initialState = { value: [] };
export const permissionsSlice = createSlice({
  name: "permissionsSlice",
  initialState,
  reducers: {
    GET_PERMISSIONS: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const { GET_PERMISSIONS } =
  permissionsSlice.actions;
export default permissionsSlice.reducer;
