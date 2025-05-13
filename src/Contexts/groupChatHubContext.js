import { createContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../hooks/jwtDecode";
import {
  ADD_CHANNEL,
  UPDATE_CHANNEL,
  DELETE_CHANNEL,
} from "../reducers/channelsReducer";
import * as signalR from "@microsoft/signalr";
const URL = "https://localhost:7065/groupChatHub";
export const GroupChatHubContext = createContext(null);
export default function GroupChatHubProvider({ children }) {
  const [groupChatHub, setGroupChatHub] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  useEffect(() => {
    const connectToHub = async () => {
      if (!token || groupChatHub) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${URL}?access_token=${token}`)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      connection.on("EnterGroupChat", (username, groupChat) => {
        console.log(`user ${username} has enter ${groupChat.name}!`);
      });
      connection.on("LeaveGroupChat", (lastSeenMessage) => {
        console.log(
          "User left the group chat. Last seen message:",
          lastSeenMessage
        );
      });
      connection.on("CreateChannel", (channel) => {
        dispatch(ADD_CHANNEL(channel));
      });
      connection.on("UpdateChannel", (channel) => {
        dispatch(UPDATE_CHANNEL(channel));
      });
      connection.on("DeleteChannel", (channel) => {
        dispatch(DELETE_CHANNEL(channel));
      });

      try {
        await connection.start().catch((err) => console.error("error: ", err));
        await connection.invoke("OnConnected", user.username);
        setGroupChatHub(connection);
      } catch (err) {
        console.error("GroupChatHub connection error:", err.toString());
        await connection.stop();
      }
    };
    connectToHub();
    return () => {
      if (groupChatHub) {
        groupChatHub.stop();
        setGroupChatHub(null);
        console.log("channelHub connection stopped");
      }
    };
  }, [token, user?.username, dispatch, groupChatHub]);
  return (
    <GroupChatHubContext.Provider value={groupChatHub}>
      {children}
    </GroupChatHubContext.Provider>
  );
}
