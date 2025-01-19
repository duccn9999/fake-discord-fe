import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { store } from "../redux/store";
const URL = "https://localhost:7065/fakeDiscordHub";

const connection = new HubConnectionBuilder()
  .withUrl(URL, {
    accessTokenFactory: () => store.getState().token.value,
  })
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Information)
  .build();
connection.on("UserConnected", (username) => {
  console.log(`User ${username} has connected!!!`);
});
connection.on("GroupChatUpdated", (groupChat) => {
  console.log("Group chat updated:", groupChat);
  window.location.reload();
});
connection
  .start()
  .then(() => {
    console.log("SignalR connected successfully.");
  })
  .catch((err) => {
    console.error("SignalR connection error:", err.toString());
  });

export default connection;
