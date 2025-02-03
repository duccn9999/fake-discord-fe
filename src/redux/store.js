import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "../reducers/tokenReducer";
import channelsReducer from "../reducers/channelsReducer";
import messagesReducer from "../reducers/messagesReducer";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "token",
  storage,
};

const persistedReducer = persistReducer(persistConfig, tokenReducer);
export const store = configureStore({
  reducer: {
    token: persistedReducer,
    channels: channelsReducer,
    messages: messagesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
