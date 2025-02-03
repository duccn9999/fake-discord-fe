import * as signalR from "@microsoft/signalr";
const URL = "https://localhost:7065/userHub";
const createUserHub = async (token) => {
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
  return connection;
};

export default createUserHub;
