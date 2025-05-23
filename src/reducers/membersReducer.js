import { createSlice } from "@reduxjs/toolkit";

export const initialState = { value: [] };
export const membersSlice = createSlice({
    name: "membersSlice",
    initialState,
    reducers: {
        GET_MEMBERS: (state, action) => {
            state.value = action.payload;
        },
        ADD_MEMBER: (state, action) => {
            state.value.push(action.payload);
        },
        UPDATE_MEMBER: (state, action) => {
            const index = state.value.findIndex(
                (member) => member.userId === action.payload.userId
            );
            if (index !== -1) {
                state.value[index] = { ...state.value[index], ...action.payload };
            }
        },
        DELETE_MEMBER: (state, action) => {
            console.log(action.payload);
            state.value = state.value.filter(
                (member) => member.userId !== action.payload.userId
            );
        },
    },
});
export const { GET_MEMBERS, ADD_MEMBER, UPDATE_MEMBER, DELETE_MEMBER } =
    membersSlice.actions;
export default membersSlice.reducer;
