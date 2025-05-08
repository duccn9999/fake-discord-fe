import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "../reducers/tokenReducer";
import channelsReducer from "../reducers/channelsReducer";
import messagesReducer from "../reducers/messagesReducer";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import notificationsReducer from "../reducers/notificationsReducer";
import mentionsCountReducer from "../reducers/mentionsReducer"
const persistConfig = {
  key: "token",
  storage,
};

const persistedReducer = persistReducer(persistConfig, tokenReducer);
export const store = configureStore({
  reducer: {
    token: persistedReducer,
    channels: channelsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    mentions: mentionsCountReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
