import * as signalR from "@microsoft/signalr";
import {
  ADD_NOTIFICATION,
  GET_NOTIFICATIONS,
} from "../reducers/notificationsReducer";
import {
  ADD_MESSAGE,
  DELETE_MESSAGE,
  UPDATE_MESSAGE,
} from "../reducers/messagesReducer";
const URL = "https://localhost:7065/userHub";
const createUserHub = async (token, dispatch) => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
  try {
    await connection.start(); // Ensure await here
    console.log("SignalR connected successfully.");
  } catch (err) {
    console.error("SignalR connection error:", err.toString());
  }
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
  return connection;
};

export default createUserHub;
