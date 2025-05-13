import { createContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../hooks/jwtDecode";
import * as signalR from "@microsoft/signalr";
import { ADD_NOTIFICATION } from "../reducers/notificationsReducer";
import {
  ADD_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
} from "../reducers/messagesReducer";
const URL = "https://localhost:7065/userHub";
export const UserHubContext = createContext(null);
export default function UserHubProvider({ children }) {
  const [userHub, setUserHub] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  useEffect(() => {
    const connectToHub = async () => {
      if (!token || userHub) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${URL}?access_token=${token}`)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      connection.on("UserConnected", (username) => {
        console.log(`User ${username} has connected!!`);
      });
      connection.on("UserDisconnected", (lastSeenMessage) => {
        console.log(lastSeenMessage);
      });
      connection.on("SendFriendRequest", (notification) => {
        dispatch(ADD_NOTIFICATION(notification));
      });
      connection.on("AcceptFriendRequest", (notification) => {
        dispatch(ADD_NOTIFICATION(notification));
      });
      connection.on("CancelFriendRequest", (notification) => {
        dispatch(ADD_NOTIFICATION(notification));
      });
      connection.on("SendPrivateMessage", (message) => {
        dispatch(ADD_MESSAGE(message));
      });
      connection.on("UpdatePrivateMessage", (message) => {
        dispatch(UPDATE_MESSAGE(message));
      });
      connection.on("DeletePrivateMessage", (message) => {
        dispatch(DELETE_MESSAGE(message));
      });
      connection.on("DeletePrivateMessageAttachment", (message) => {
        dispatch(UPDATE_MESSAGE(message));
      });
      try {
        await connection.start().catch((err) => console.error("error: ", err));
        await connection.invoke("OnConnected", user.username);
        setUserHub(connection);
      } catch (err) {
        console.error("UserHub connection error:", err.toString());
        await connection.stop();
      }
    };
    connectToHub();
    return () => {
      if (userHub) {
        userHub.stop();
        setUserHub(null);
        console.log("userHub connection stopped");
      }
    };
  }, [token, user?.username, dispatch, userHub]);

  return (
    <UserHubContext.Provider value={userHub}>
      {children}
    </UserHubContext.Provider>
  );
}
