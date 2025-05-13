import { createContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../hooks/jwtDecode";
import * as signalR from "@microsoft/signalr";
import {
  ADD_MESSAGE,
  DELETE_MESSAGE,
  UPDATE_MESSAGE,
} from "../reducers/messagesReducer";
import {
  SET_MENTION_COUNT,
  CLEAR_MENTION_COUNT,
  ADD_MENTION_COUNT,
} from "../reducers/mentionsReducer";
const URL = "https://localhost:7065/channelHub";
export const ChannelHubContext = createContext(null);
export default function ChannelHubProvider({ children }) {
  const [channelHub, setChannelHub] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  useEffect(() => {
    const connectToHub = async () => {
      if (!token || channelHub) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${URL}?access_token=${token}`)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      connection.on("EnterChannel", (username, channel) => {
        console.log(
          `User ${username} has entered channel ${channel.channelName}`
        );
      });
      connection.on("OnConnected", (username) => {
        console.log(
          `User ${username} connected`
        );
      });
      connection.on("SendMessage", (message) => {
        dispatch(ADD_MESSAGE(message));
      });

      connection.on("UpdateMessage", (message) => {
        dispatch(UPDATE_MESSAGE(message));
      });

      connection.on("DeleteMessage", (message) => {
        dispatch(DELETE_MESSAGE(message));
      });

      connection.on("UserLeave", (lastSeenMessage) => {
        console.log("UserLeave event received:", lastSeenMessage);
      });

      connection.on("SetMentionCount", (mentionCounts) => {
        dispatch(
          SET_MENTION_COUNT({
            channelId: mentionCounts.channelId,
            mentionsCount: mentionCounts.mentionsCount,
          })
        );
      });

      connection.on("MarkMentionsAsRead", (channelId) => {
        dispatch(CLEAR_MENTION_COUNT(channelId));
      });

      connection.on("AddMentionCount", (channelId) => {
        dispatch(ADD_MENTION_COUNT(channelId));
      });

      try {
        await connection.start().catch(err => console.error("error: ", err));
        await connection.invoke("OnConnected", user.username);
        setChannelHub(connection);
      } catch (err) {
        console.error("ChannelHub connection error:", err.toString());
        await connection.stop();
      }
    };
    connectToHub();
    return () => {
      if (channelHub) {
        channelHub.stop();
        setChannelHub(null);
        console.log("channelHub connection stopped");
      }
    };
  }, [token, user?.username, dispatch, channelHub]);

  return (
    <ChannelHubContext.Provider value={channelHub}>
      {children}
    </ChannelHubContext.Provider>
  );
}
