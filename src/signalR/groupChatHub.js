import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import {ADD_CHANNEL, UPDATE_CHANNEL, DELETE_CHANNEL} from "../reducers/channelsReducer";
const URL = "https://localhost:7065/groupChatHub";
let connection = null;
const createGroupChatHub = async (token, dispatch) => {
  if (connection) {
    return connection;
  }
  connection = new HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
  try {
    await connection.start(); // Ensure await here
    console.log("GroupChatHub connected successfully.");
  } catch (err) {
    console.error("SignalR connection error:", err.toString());
  }

  connection.on("EnterGroupChat", (username, groupChat) => {
    console.log(`user ${username} has enter ${groupChat.name}!`);
  });
  connection.on("CreateChannel", (channel) => {
    dispatch(ADD_CHANNEL(channel));
  });
  connection.on("UpdateChannel", (channel) => {
    dispatch(UPDATE_CHANNEL(channel))
  });
  connection.on("DeleteChannel", (channel) => {
    dispatch(DELETE_CHANNEL(channel))
  });
  return connection;
};

export default createGroupChatHub;
