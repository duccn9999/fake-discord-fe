import * as signalR from "@microsoft/signalr";
import {
  ADD_MESSAGE,
  DELETE_MESSAGE,
  UPDATE_MESSAGE,
} from "../reducers/messagesReducer";
const URL = "https://localhost:7065/channelHub";
let connection = null;
const createChannelHub = async (token, dispatch) => {
  if (connection) {
    return connection;
  }
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
  try {
    await connection.start(); // Ensure await here
    console.log("ChannelHub connected successfully.");
  } catch (err) {
    console.error("ChannelHub connection error:", err.toString());
  }
  connection.on("EnterChannel", (username, channel) => {
    console.log(`user ${username} has enter channel ${channel.channelName}`);
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
  connection.on("UserLeave", (username, channel) => {
    console.log(`User ${username} has left this ${channel.channelName}!`);
  });
  return connection;
};

export default createChannelHub;
