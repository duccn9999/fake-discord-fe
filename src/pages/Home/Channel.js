import { useSelector } from "react-redux";
import Styles from "./Home.module.css";
import useJwtDecode from "../../hooks/jwtDecode";
import { useState } from "react";
export function Channel({
  channel,
  setChannelClick,
  channelTracker,
  channelHub,
}) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const handleClick = () => {
    channelTracker(channel);
    setChannelClick(true);
    channelHub.invoke("OnConnected", user.username, channel);
  };
  return (
    <div>
      <button
        className={`bgBlack4 textFaded ${Styles.channel}`}
        onClick={handleClick}
      >
        {channel.channelName}
      </button>
    </div>
  );
}
