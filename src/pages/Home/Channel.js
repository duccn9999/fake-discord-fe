import { useSelector } from "react-redux";
import Styles from "./Home.module.css";
import useJwtDecode from "../../hooks/jwtDecode";
import { FaCog } from "react-icons/fa";
import { CiHashtag } from "react-icons/ci";
import { useContext, useEffect } from "react";
import COMMON from "../../utils/Common";
import axios from "axios";
import  {ChannelHubContext} from "../../Contexts/channelHubContext";
import { GroupChatIdContext } from "../../Contexts/groupChatIdContext";
export function Channel({
  channel,
  setChannelClick,
  channelTracker,
  handleToggleBigForms,
  setChannel,
}) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const permissions = useSelector(state => state.permissions.value);
  const mentions = useSelector(
    (state) => state.mentions.value[channel.channelId]
  );
  const channelHub = useContext(ChannelHubContext);
  const groupChatId = useContext(GroupChatIdContext).groupChatId;
  const handleClick = () => {
    channelTracker(channel);
    setChannelClick(true);
    channelHub.invoke("EnterChannel", user.username, {
      ...channel,
      groupChatId,
    });
  };
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Messages/GetMentionCountByUser/${user.userId}/${channel.channelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        channelHub.invoke(
          "SetMentionCount",
          user.username,
          res.data.channelId,
          res.data.mentionsCount
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [token, user.userId, channel.channelId]);
  return (
    <div className="dFlex" style={{ marginBottom: "6px" }}>
      <button
        className={`bgBlack4 textFaded ${Styles.channel} dFlex alignCenter w100 justifySpaceBetween`}
        onClick={handleClick}
        style={{ textAlign: "left" }}
      >
        <div className="dFlex alignCenter" style={{ minWidth: "85px" }}>
          <CiHashtag />
          {channel.channelName}
        </div>

        {mentions === null ? (
          <div style={{ width: "21px", height: "21px" }}></div> // loading placeholder
        ) : mentions > 0 ? (
          <span
            className="notificationDot"
            style={{
              position: "static",
            }}
          >
            {mentions}
          </span>
        ) : null}
      </button>
      {permissions?.includes("CanManageChannels") && (
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
      )}
    </div>
  );
}
