export const initialState = [];

const groupChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET": {
      return [...action.payload]; // Replace state with new chats
    }
    case "ADD": {
      return [...state, action.payload]; // Add new chat
    }
    case "DELETE": {
      return state.filter((chat) => chat.id !== action.payload.id); // Remove chat by ID
    }
    case "UPDATE": {
      return state.map((chat) =>
        chat.id === action.payload.id ? { ...chat, ...action.payload } : chat
      ); // Update matching chat
    }
    default:
      return state; // Return current state if action is unhandled
  }
};

export default groupChatReducer;
