import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { MdOutlineDelete } from "react-icons/md";
import axios from "axios";
import { useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import useJwtDecode from "../../hooks/jwtDecode";
import { useFetchRolesByGroupChat } from "../../hooks/fetchRolesByGroupChat";
import { useFetchUsersInGroupChat } from "../../hooks/fetchUsersInGroupChat";
import $ from "jquery";
export function EditChannelForm({ handleToggleBigForms, channel }) {
  const [toggle, setToggle] = useState(1);
  const [channelName, setChannelName] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(channel);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const updateToggle = (value) => {
    setToggle(value);
  };
  const updatedChannel = {
    ChannelId: channel.channelId,
    ChannelName: channelName ? channelName : channel.channelName,
    UserModified: user.userId,
  };
  // update channel
  const updateChannel = (e) => {
    e.preventDefault();
    axios
      .put(`${COMMON.API_BASE_URL}Channels/UpdateChannel`, updatedChannel, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Update success", {
          position: "top-right",
          autoClose: 3000,
        });
        setCurrentChannel(response.data);
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };
  // delete channel
  const deleteChannel = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}Channels/DeleteChannel/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        toast.success("Delete success", {
          position: "top-right",
          autoClose: 3000,
        });
        window.location.reload();
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };
  // get roles from group chat
  const { rolesByGroupChat, fetchRolesByGroupChat } =
    useFetchRolesByGroupChat();
  // get members from group chat
  const { usersInGroupChat, fetchUsersInGroupChat } =
    useFetchUsersInGroupChat();
  return (
    <div style={{ height: "100vh" }} className="bgBlack4 textFaded">
      <div className="dFlex justifySpaceBetween" style={{ height: "100%" }}>
        <div className="tabs bgBlack3">
          <div id="channelProfileOption">
            <h4>{currentChannel.channelName} Text channel</h4>
            <div
              className="bgBlack3 textFaded"
              id="overviewBtn"
              onClick={() => updateToggle(1)}
            >
              Overview
            </div>
            <div
              className="bgBlack3 textFaded"
              onClick={() => {
                updateToggle(2);
                fetchRolesByGroupChat(currentChannel.groupChatId);
                fetchUsersInGroupChat(currentChannel.groupChatId);
              }}
            >
              Permissions
            </div>
            <div
              className="bgBlack3 textFaded dFlex alignCenter justifyCenter"
              onClick={() => deleteChannel(currentChannel.channelId)}
            >
              Delete
              <MdOutlineDelete />
            </div>
          </div>
        </div>
        <div
          className="tabContent w100"
          style={{
            textAlign: "left",
            flexGrow: 1,
            padding: "0 2rem 0 2rem",
          }}
        >
          {toggle === 1 && (
            <Overview
              channel={currentChannel}
              toggle={toggle}
              setChannelName={setChannelName}
              channelName={channelName}
              updateChannel={updateChannel}
            />
          )}

          {toggle === 2 && (
            <Permissions
              channel={currentChannel}
              toggle={toggle}
              rolesByGroupChat={rolesByGroupChat}
              usersInGroupChat={usersInGroupChat}
              updateToggle={updateToggle}
            />
          )}
        </div>
        <div>
          <button
            onClick={() => handleToggleBigForms(1)}
            style={{ float: "right" }}
            className="btn bgDanger textFaded"
          >
            <IoIosClose />
          </button>
        </div>
      </div>
    </div>
  );
}
function Overview({
  channel,
  toggle,
  setChannelName,
  channelName,
  updateChannel,
}) {
  return (
    <div>
      <h4>Overview</h4>
      <div>
        <form
          style={{ width: "400px", margin: "auto" }}
          onSubmit={updateChannel}
        >
          <label htmlFor="name">Channel name</label>
          <input
            id="name"
            type="text"
            onChange={(e) => setChannelName(e.target.value)}
            value={!channelName ? channel.channelName : channelName}
          />
          <button className="btn bgDanger textFaded">Submit</button>
        </form>
      </div>
    </div>
  );
}
function Permissions({
  rolesByGroupChat,
  usersInGroupChat,
  channel,
  toggle,
  updateToggle,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  // get allowed users of channel
  useEffect(
    () => async () => {
      await axios
        .get(
          `${COMMON.API_BASE_URL}Channels/GetAllowedUsersByChannelId/${channel.groupChatId}/${channel.channelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setSelectedUsers(response.data);
        });
    },
    [token, channel.channelId, channel.groupChatId]
  );
  // get allowed roles of channel
  useEffect(
    () => async () => {
      await axios
        .get(
          `${COMMON.API_BASE_URL}Channels/GetAllowedRolesByChannelId/${channel.groupChatId}/${channel.channelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setSelectedRoles(response.data);
        });
    },
    [token, channel.channelId, channel.groupChatId]
  );
  const handleUsersCheckboxChange = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  const handleRolesCheckboxChange = (roleId) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };
  const updatePrivateChannelPermissions = (e) => {
    e.preventDefault();
    const data = {
      AllowedRoles: selectedRoles,
      AllowedUsers: selectedUsers,
    };
    axios
      .put(
        `${COMMON.API_BASE_URL}Channels/UpdatePrivateChannelPermissions/${channel.channelId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        toast.success(`${response.data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        updateToggle(1);
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };
  return (
    <div>
      <h4>PERMISSIONS</h4>
      <form onSubmit={updatePrivateChannelPermissions}>
        <div style={{ textAlign: "left" }}>
          <label>
            <strong>Roles</strong>
          </label>
          {rolesByGroupChat.map((role, index) => (
            <div key={index} className="dFlex alignCenter justifySpaceBetween">
              <p style={{ color: role.color, fontWeight: "bold" }}>
                {role.roleName}
              </p>
              <div>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.roleId)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#5cb85c",
                  }}
                  onChange={() => handleRolesCheckboxChange(role.roleId)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="inputGroup">
          <label>
            <strong>Members</strong>
          </label>
          {usersInGroupChat.map((user, index) => (
            <div key={index} className="dFlex alignCenter justifySpaceBetween">
              <p style={{ fontWeight: "bold" }}>{user.userName}</p>
              <div>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.userId)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#5cb85c",
                  }}
                  onChange={() => handleUsersCheckboxChange(user.userId)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="inputGroup dFlex alignCenter justifySpaceBetween">
          <button
            type="button"
            className="btn bgSecondary textFaded"
            onClick={() => updateToggle(1)}
          >
            Back
          </button>
          <button type="submit" className="btn bgSuccess textFaded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
export default EditChannelForm;
