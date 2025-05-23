import { createSlice } from "@reduxjs/toolkit";

export const initialState = { value: [] };
export const blockedFriendsSlice = createSlice({
  name: "blockedFriendsSlice",
  initialState,
  reducers: {
    GET_BLOCKED_FRIENDS: (state, action) => {
      state.value = action.payload;
    },
    ADD_BLOCKED_FRIEND: (state, action) => {
      state.value.push(action.payload);
    },
    UPDATE_BLOCKED_FRIEND: (state, action) => {
      const index = state.value.findIndex(
        (friend) => friend.id === action.payload.id
      );
      if (index !== -1) {
        state.value[index] = { ...state.value[index], ...action.payload };
      }
    },
    DELETE_BLOCKED_FRIEND: (state, action) => {
      state.value = state.value.filter(
        (friend) => friend.id !== action.payload.id
      );
    },
  },
});
export const {
  GET_BLOCKED_FRIENDS,
  ADD_BLOCKED_FRIEND,
  UPDATE_BLOCKED_FRIEND,
  DELETE_BLOCKED_FRIEND,
} = blockedFriendsSlice.actions;
export default blockedFriendsSlice.reducer;
