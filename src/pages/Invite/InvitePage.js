import { useParams, useNavigate  } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import COMMON from "../../utils/Common";
import { useSelector } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
function InvitePage() {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [groupChat, setGroupChat] = useState(null);
  const { inviteCode } = useParams(); // Get invite code from URL
  const navigate = useNavigate();
  // get group chat by invite code
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}GroupChats/GetGroupChatByInviteCode/${inviteCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setGroupChat(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, [token, inviteCode]);
  const joinGroupChat = () => {
    axios
      .post(
        `${COMMON.API_BASE_URL}GroupChats/Invite`,
        {
          userId: user?.userId, // Optional chaining to prevent errors if `user` is null
          groupChatId: groupChat?.groupChatId, // Optional chaining to prevent errors if `groupChat` is null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 204) {
          navigate("/home");
        }
      })
      .catch((err) => {
        console.error("Error joining the group chat:", err);
      });
  };

  return (
    <div
      style={{ textAlign: "center", height: "100vh" }}
      className="bgBlack2 dFlex alignCenter justifyCenter"
    >
      <div style={{ padding: "2rem", borderRadius: "8%" }} className="bgFaded">
        <h2 style={{ margin: "auto" }}>You're Invited to {groupChat?.name}!</h2>
        <div>
          <img
            src={groupChat?.coverImage}
            alt="img"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
        <button
          onClick={joinGroupChat}
          style={{ marginTop: "10px" }}
          className="btn bgPrimary textFaded"
        >
          Click here to join
        </button>
      </div>
    </div>
  );
}

export default InvitePage;
