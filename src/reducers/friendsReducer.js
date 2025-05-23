import { createSlice } from "@reduxjs/toolkit";

export const initialState = { value: [] };
export const friendsSlice = createSlice({
  name: "friendsSlice",
  initialState,
  reducers: {
    GET_FRIENDS: (state, action) => {
      state.value = action.payload;
    },
    ADD_FRIEND: (state, action) => {
      state.value.push(action.payload);
    },
    UPDATE_FRIEND: (state, action) => {
      const index = state.value.findIndex(
        (friend) => friend.id === action.payload.id
      );
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload };
      }
    },
    DELETE_FRIEND: (state, action) => {
      console.log(action.payload);
      state.value = state.value.filter(
        (friend) => friend.id !== action.payload.id
      );
    },
  },
});
export const { GET_FRIENDS, ADD_FRIEND, UPDATE_FRIEND, DELETE_FRIEND } =
  friendsSlice.actions;
export default friendsSlice.reducer;
