import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
const URL = "https://localhost:7065/groupChatHub";

const createGroupChatHub = async (token) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  try {
    await connection.start(); // Ensure await here
    console.log("SignalR connected successfully.");
  } catch (err) {
    console.error("SignalR connection error:", err.toString());
  }
  connection.on("GroupChatsRefresh", () => {
    console.log("Group chat refreshed:");
    window.location.reload();
  });
  return connection;
};

export default createGroupChatHub;
