import { useSelector } from "react-redux";
import Styles from "./Home.module.css";
import useJwtDecode from "../../hooks/jwtDecode";
import { FaCog } from "react-icons/fa";
import { CiHashtag } from "react-icons/ci";
import { useState } from "react";
export function Channel({
  channel,
  setChannelClick,
  channelTracker,
  channelHub,
  handleToggleBigForms,
  setChannel,
}) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const handleClick = () => {
    channelTracker(channel);
    setChannelClick(true);
    channelHub.invoke("OnConnected", user.username, channel);
  };
  return (
    <div className="dFlex" style={{ marginBottom: "6px" }}>
      <button
        className={`bgBlack4 textFaded ${Styles.channel} dFlex alignCenter`}
        onClick={handleClick}
        style={{ textAlign: "left" }}
      >
        <CiHashtag />
        {channel.channelName}
      </button>
      <button
        className="bgBlack2"
        style={{ border: "none", borderRadius: "0 5px 5px 0" }}
        onClick={() => {
          handleToggleBigForms(2);
          setChannel(channel);
        }}
      >
        <FaCog style={{ color: "white" }} />
      </button>
    </div>
  );
}
