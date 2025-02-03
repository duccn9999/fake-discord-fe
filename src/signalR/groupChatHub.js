import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
const URL = "https://localhost:7065/groupChatHub";
let connection = null;
const createGroupChatHub = async (token) => {
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

  connection.on("GroupChatsRefresh", () => {
    console.log("Group chat refreshed:");
    window.location.reload();
  });
  return connection;
};

export default createGroupChatHub;
