import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
const URL = "https://localhost:7065/fakeDiscordHub";

const createConnectionHub = async (token) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Trace)
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
  connection.on("GroupChatsRefresh", () => {
    console.log("Group chat refreshed:");
    window.location.reload();
  });
  return connection;
};

export default createConnectionHub;
