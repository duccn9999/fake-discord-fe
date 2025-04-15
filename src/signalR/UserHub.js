import * as signalR from "@microsoft/signalr";
import {
  ADD_NOTIFICATION,
  GET_NOTIFICATIONS,
} from "../reducers/notificationsReducer";
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
  connection.on("SendFriendRequest", (notification) => {
    dispatch(ADD_NOTIFICATION(notification));
  });
  connection.on("AcceptFriendRequest", (notification) => {
    dispatch(ADD_NOTIFICATION(notification));
  });
  connection.on("CancelFriendRequest", (notification) => {
    dispatch(ADD_NOTIFICATION(notification));
  });
  return connection;
};

export default createUserHub;
