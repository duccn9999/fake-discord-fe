export const INITIAL_STATE = [];

const groupChatReducer = (state, action) => {
  switch (action.type) {
    case "GET": {
      return [...action.payload];
    }
    case "ADD": {
      return [...state, action.payload];
    }

    case "DELETE": {
      return state.filter((chat) => chat.id !== action.payload.id);
    }
    case "UPDATE": {
      return null;
    }
    default:
      return state;
  }
};

export default groupChatReducer;
