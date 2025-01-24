import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import Styles from "../pages/Home/Home.module.css";
import $ from "jquery";
const URL = "https://localhost:7065/channelHub";

const createChannelHub = async (token) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${URL}?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  try {
    await connection.start(); // Ensure await here
    console.log("ChannelHub connected successfully.");
  } catch (err) {
    console.error("ChannelHub connection error:", err.toString());
  }
  connection.on("ChannelCreated", (channelName) => {
    if (channelName) {
      const channel = `<div>
        <button class="bgBlack4 textFaded ${Styles.channel}">
          ${channelName}
        </button>
      </div>`;
      $("#channelsContainer").append(channel);
    } else {
      console.error("Invalid data received from ChannelCreated event:", channelName);
    }
  });

  return connection;
};

export default createChannelHub;
