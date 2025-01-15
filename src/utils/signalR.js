import { HubConnectionBuilder } from "@microsoft/signalr";
const URL = "https://localhost:7065/fakeDiscordHub";
const connection = new HubConnectionBuilder().withUrl(URL).build();

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
