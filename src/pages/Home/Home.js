import Styles from "./Home.module.css";
import { FaPlus } from "react-icons/fa";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import $ from "jquery";
import COMMON from "../../utils/Common";
import MessageSectionNotFound from "../Errors/MessageSectionNotFound";
import { Channel } from "./Channel";
import { MessagesContainer } from "./MessagesContainer";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoIosOptions } from "react-icons/io";
import createUserHub from "../../signalR/userHub";
import createGroupChatHub from "../../signalR/groupChatHub";
import createChannelHub from "../../signalR/channelHub";
import useJwtDecode from "../../hooks/jwtDecode";
import { useDispatch, useSelector } from "react-redux";
import { GET_CHANNELS } from "../../reducers/channelsReducer";
import { toast } from "react-toastify";
import { clear } from "../../reducers/tokenReducer";
import EditChannelForm from "../Forms/EditChannelForm";
import { MdExpandMore } from "react-icons/md";
import EditGroupChatForm from "../Forms/EditGroupChatForm";
import { IoHomeSharp } from "react-icons/io5";
import { HomePageContent } from "./HomePageContent";
const UserHubContext = createContext();
const GroupChatHubContext = createContext();
const ChannelHubContext = createContext();
function GroupChat({ groupChat, handleGroupChatClick, groupChatTracking }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const groupChatHub = useContext(GroupChatHubContext);
  return (
    <div
      className={`${Styles.groupChat}`}
      onClick={() => {
        handleGroupChatClick(groupChat.groupChatId);
        groupChatTracking(groupChat);
        groupChatHub
          .invoke("OnEnterGroupChat", user.username, groupChat)
          .catch((err) => console.error("SignalR Error:", err));
      }}
      data-name={groupChat.name}
    >
      <div className={`${Styles.avatar} dInlineBlock`}>
        <img src={groupChat.coverImage} alt={`img-${groupChat.groupChatId}`} />
      </div>
    </div>
  );
}
function CreateGroupChatForm({ isCreateGroupChatFormOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const [groupChatHub, setGroupChatHub] = useState(null);
  const token = useSelector((state) => state.token.value);
  const dispatch = useDispatch();
  let user = useJwtDecode(token);

  useEffect(() => {
    const createHub = async () => {
      try {
        const groupChatHub = await createGroupChatHub(token, dispatch);
        setGroupChatHub(groupChatHub);
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    createHub();
    return () => {
      if (groupChatHub) {
        groupChatHub.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [token]);
  // Handle preview image
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    setPreview(file);
    return () => URL.revokeObjectURL(file);
  }, [file]);
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFile(reader.result); // Base64 string
      };
    }
  };
  const createGroupChat = async (e) => {
    e.preventDefault();
    try {
      // After the image is uploaded, proceed with creating the group chat
      const GroupChat = {
        Name: groupChatName,
        CoverImage: file,
        userCreated: user.userId,
      };
      await axios
        .post(`${COMMON.API_BASE_URL}GroupChats/Create`, GroupChat, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          window.location.reload();
        });
      onClose(true); // Close the modal or perform any other actions
    } catch (error) {
      console.error("Error uploading image:", error);
      $(".error").html(`Error uploading image: ${error.message}`);
    }
  };
  if (!isCreateGroupChatFormOpen) return null;
  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div
          className="formContainer posAbsolute centerWithTransform"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={createGroupChat} className="form">
            <h2>Create Group Chat</h2>
            <p className="error textDanger"></p>
            <div className="inputGroup">
              <label htmlFor="groupChatName">Group chat Name</label>
              <input
                type="text"
                id="groupChatName"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="coverImage">Cover image</label>
              <input
                type="file"
                id="coverImage"
                className={Styles.coverImage}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            {preview && (
              <div className="previewImage">
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <div className="inputGroup">
              <button type="submit" className="btnSmall bgDanger">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
function GroupChatsContainer({ handleGroupChatClick }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [groupChats, setGroupChats] = useState([]);
  const [groupChatHub, setGroupChatHub] = useState(null);
  const [currentGroupChat, setCurrentGroupChat] = useState(null);
  const [previousGroupChat, setPreviousGroupChat] = useState(null);
  useEffect(() => {
    const createHub = async () => {
      try {
        const groupChatHub = await createGroupChatHub(token, dispatch);
        setGroupChatHub(groupChatHub);
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    createHub();
    return () => {
      if (groupChatHub) {
        groupChatHub.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [token]);
  // Handle display joined groupChat
  const fetchGroupChats = async (userId) => {
    const response = await axios.get(
      `${COMMON.API_BASE_URL}GroupChats/GetJoinedGroupChats/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correctly set Authorization header
        },
      }
    );
    if (response.status === 200) {
      setGroupChats(response.data);
    } else if (response.status === 401) {
      dispatch(clear(token));
    }
  };
  useEffect(() => {
    fetchGroupChats(user.userId);
    return () => {
      console.log("Group chat displayed!!!");
    };
  }, [user.userId]);
  // track current groupChat that user enters
  const groupChatTracking = (value) => {
    setCurrentGroupChat(value);
    if (
      currentGroupChat &&
      value.groupChatId !== currentGroupChat.groupChatId
    ) {
      setPreviousGroupChat(currentGroupChat);
    }
  };
  // disconnect from groupChat
  useEffect(() => {
    if (previousGroupChat) {
      groupChatHub.invoke("OnLeaveGroupChat", user.username, previousGroupChat);
    }
  }, [previousGroupChat]);
  if (!groupChats.length) {
    return;
  }
  return (
    <GroupChatHubContext.Provider value={groupChatHub}>
      <div className="groupChatsContainer" id="groupChatsContainer">
        {groupChats.map((groupChat) => (
          <GroupChat
            key={groupChat.groupChatId}
            groupChat={groupChat}
            handleGroupChatClick={handleGroupChatClick}
            groupChatTracking={groupChatTracking}
          />
        ))}
      </div>
    </GroupChatHubContext.Provider>
  );
}
function EditProfileForm({ isEditProfileFormOpen, onClose, user, token }) {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (changePassword) {
      $(".changePasswordWrapper").css("display", "block");
      $(".inputGroup:has(#password)").css("display", "none");
      $("#changePwdbtnSmall").text("Undo");
    } else {
      $(".changePasswordWrapper").css("display", "none");
      $(".inputGroup:has(#password)").css("display", "block");
      $("#changePwdbtnSmall").text("Change password");
    }
  }, [changePassword]);
  const updateUser = {
    UserId: user.userId,
    Username: username ? username : user.username,
    Password: password ? password : user.password,
    Avatar: avatar ? avatar : user.avatar,
    Email: email ? email : user.email,
  };
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${COMMON.API_BASE_URL}Users/UpdateProfile/${user.userId}`,
        updateUser, // This is the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 204) {
        toast.success("Update profile success", {
          position: "top-right",
          autoClose: 5000,
        });
        onClose(true);
        dispatch(clear(token));
      }
    } catch (err) {
      toast.error("Failed to update profile: " + err.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };
  if (!isEditProfileFormOpen) {
    return null;
  }
  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div
          className="formContainer posAbsolute centerWithTransform"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={updateProfile} className="form">
            <h2>Edit Profile</h2>
            <p className="error textDanger"></p>
            <div className="inputGroup">
              <input
                type="image"
                alt="img"
                id="avatar"
                onChange={(e) => setAvatar(e.target.value)}
                className="avatarCircle"
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                value={username ? username : user.username}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email ? email : user.email}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={user.password}
                disabled={true}
              />
            </div>
            <div className="changePasswordWrapper" style={{ display: "none" }}>
              <div className="inputGroup">
                <label htmlFor="newPassword">New password</label>
                <input
                  type="password"
                  id="newPassword"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="inputGroup">
                <label htmlFor="reEnterNewPassword">
                  Enter new password again
                </label>
                <input
                  type="password"
                  id="reEnterNewPassword"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="inputGroup">
              <button
                className="btnSmall bgSuccess"
                onClick={(e) => {
                  e.preventDefault();
                  setChangePassword(!changePassword);
                }}
                id="changePwdbtnSmall"
              >
                Change Password
              </button>
              <button type="submit" className="btnSmall bgDanger">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
function GroupChatContent({
  groupChatId,
  isGroupChatClicked,
  isChannelClicked,
  isHomeBtnClicked,
  setCreateChannelFormOpen,
  setChannelClick,
  handleToggleBigForms,
  channel,
  setChannel,
  groupChat,
  setGroupChat,
  setEditGroupChatForm,
}) {
  const [isChannelExist, setChannelExist] = useState(true);
  const [previousChannel, setPreviousChannel] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [channelHub, setChannelHub] = useState(null);
  useEffect(() => {
    const createHub = async () => {
      try {
        const channelHub = await createChannelHub(token, dispatch);
        setChannelHub(channelHub);
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    createHub();
    return () => {
      if (channelHub) {
        channelHub.stop();
        console.log("channelHub stopped");
      }
    };
  }, [token]);
  useEffect(() => {
    const fetchGroupChat = async () => {
      if (isGroupChatClicked && groupChatId) {
        try {
          console.log(`Fetching group chat with ID: ${groupChatId}`);
          const response = await axios.get(
            `${COMMON.API_BASE_URL}GroupChats/GetGroupChatById/${groupChatId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200) {
            setGroupChat(response.data);
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error fetching group chat:", error.message);
          toast.error("Failed to enter group chat: " + error.message, {
            position: "top-right",
            autoClose: 5000,
          });
          dispatch(clear(token));
        }
      } else {
        setGroupChat(null);
      }
    };
    fetchGroupChat();
  }, [groupChatId, isGroupChatClicked]);
  const channelTracker = (value) => {
    if (channel && channel?.channelId !== value.channelId) {
      setPreviousChannel(channel);
    }
    if (!channel || channel.channelId !== value.channelId) {
      setChannel(value);
    }
  };
  // disconnect from channel
  useEffect(() => {
    if (previousChannel) {
      channelHub.invoke("OnLeave", user.username, previousChannel);
    }
  }, [previousChannel]);
  if (!groupChatId) {
    return;
  }
  if (isHomeBtnClicked) {
    return;
  }
  return (
    <div className="dFlex">
      <div
        className="header bgBlack3 posRelative"
        style={{
          overflowY: "auto",
          width: "10%",
          minWidth: "150px",
          height: "100vh",
        }}
      >
        <div className="posSticky" style={{ top: 0, left: 0, right: 0 }}>
          <button
            className="btnSmall w100 bgBlack2 dFlex alignCenter"
            onClick={() => {
              $("#EditGroupChatbtnSmall").toggle();
            }}
          >
            <h3 className={`textFaded ${Styles.groupChatTitle}`}>
              {groupChat ? groupChat.name : "loading..."}
            </h3>
            <MdExpandMore className="textFaded" />
          </button>
          <div
            className="dNone posAbsolute w100"
            id="EditGroupChatbtnSmall"
            style={{ zIndex: 1 }}
          >
            <button
              className="w100 btnSmall textFaded dFlex alignCenter justifySpaceAround"
              style={{ backgroundColor: "black" }}
              onClick={() => {
                setEditGroupChatForm(true);
                handleToggleBigForms(3);
              }}
            >
              <span>Edit group chat profile</span>
              <FaCog style={{ width: "20px" }} />
            </button>
          </div>
        </div>
        <button
          className="bgBlack3 textFaded borderNone w100"
          onClick={() => setCreateChannelFormOpen(true)}
        >
          Add Channels <FaPlus style={{ width: "10px", height: "10px" }} />
        </button>
        <ChannelsContainer
          groupChatId={groupChatId}
          setChannelExist={setChannelExist}
          setChannelClick={setChannelClick}
          channelTracker={channelTracker}
          channelHub={channelHub}
          handleToggleBigForms={handleToggleBigForms}
          setChannel={setChannel}
        />
      </div>
      {!isChannelExist ? <MessageSectionNotFound /> : null}
      {isChannelClicked ? (
        <MessagesContainer
          channel={channel}
          channelHub={channelHub}
          groupChatId={groupChatId}
        />
      ) : null}
    </div>
  );
}
function ChannelsContainer({
  groupChatId,
  setChannelExist,
  setChannelClick,
  channelTracker,
  channelHub,
  handleToggleBigForms,
  setChannel,
}) {
  const channels = useSelector((state) => state.channels.value);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Channels/GetChannelsByGroupChatId/${groupChatId}/${user.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data;
        if (!data || data.length === 0) {
          setChannelExist(false);
        } else {
          setChannelExist(true);
        }
        dispatch(GET_CHANNELS(data));
      })
      .catch((error) => {
        console.error(error.response?.data || error.message);
      });
  }, [groupChatId]);
  if (!channels || channels.length === 0) {
    return null;
  }
  return (
    <ChannelHubContext.Provider value={channelHub}>
      <div id="channelsContainer">
        {channels.map((channel, index) => (
          <Channel
            key={index}
            channel={channel}
            setChannelClick={setChannelClick}
            channelTracker={channelTracker}
            channelHub={channelHub}
            handleToggleBigForms={handleToggleBigForms}
            setChannel={setChannel}
            groupChatId={groupChatId}
          />
        ))}
      </div>
    </ChannelHubContext.Provider>
  );
}
function CreateChannelForm({
  isCreateChannelFormOpen,
  onClose,
  groupChatId,
  token,
}) {
  const [channelName, setChannelName] = useState(null);
  const dispatch = useDispatch();
  const [groupChatHub, setGroupChatHub] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const channelNameRef = useRef(null);
  const [rolesByGroupChat, setRolesByGroupChat] = useState([]);
  const [usersInGroupChat, setUsersInGroupChat] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleCheckboxChange = (e) => {
    setIsPrivate(e.target.checked); // `checked` gives true/false
  };
  const handleNextButtonClick = (e) => {
    if (!channelNameRef.current.value.trim()) {
      e.stopPropagation();
    }
  };
  const handleRolesCheckbox = (roleId) => {
    setSelectedRoles(
      (prevSelectedRoles) =>
        prevSelectedRoles.includes(roleId)
          ? prevSelectedRoles.filter((id) => id !== roleId) // Remove if unchecked
          : [...prevSelectedRoles, roleId] // Add if checked
    );
  };
  const handleUsersCheckbox = (userId) => {
    setSelectedUsers(
      (prevSelectedUsers) =>
        prevSelectedUsers.includes(userId)
          ? prevSelectedUsers.filter((id) => id !== userId) // Remove if unchecked
          : [...prevSelectedUsers, userId] // Add if checked
    );
  };
  // handle create private channels
  const handlePrivateChannelForm = () => {
    if (isPrivate) {
      $("#createChannelForm").removeClass("dBlock").addClass("dNone"); // Hide public form
      $("#createPrivateChannelForm").removeClass("dNone").addClass("dBlock"); // Show private form
    } else {
      $("#createChannelForm").removeClass("dNone").addClass("dBlock"); // Show public form
      $("#createPrivateChannelForm").addClass("dNone").removeClass("dBlock"); // Hide private form
    }
  };
  // handle when user clicks the back button
  const handleBackButtonClick = () => {
    setIsPrivate(false);
    setChannelName("");
    channelNameRef.current.value = "";
    $("#createChannelForm").removeClass("dNone").addClass("dBlock"); // Show public form
    $("#createPrivateChannelForm").addClass("dNone").removeClass("dBlock"); // Hide private form
  };
  useEffect(() => {
    const createHub = async () => {
      try {
        const groupChatHub = await createGroupChatHub(token, dispatch);
        setGroupChatHub(groupChatHub);
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    createHub();
    return () => {
      if (groupChatHub) {
        groupChatHub.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [token]);
  let user = useJwtDecode(token);
  const createChannel = async (e) => {
    e.preventDefault();
    const model = {
      groupChatId: groupChatId,
      channelName: channelName,
      userCreated: user.userId,
    };
    const response = await axios.post(
      `${COMMON.API_BASE_URL}Channels/CreateChannel`,
      model, // Axios automatically stringifies JSON
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      onClose(true);
      groupChatHub.invoke("CreateChannel", response.data);
    }
    if (response.status === 401) {
      toast.error("Failed create channel: " + response.data, {
        position: "top-right",
        autoClose: 5000,
      });
      dispatch(clear(token));
    }
  };
  // get roles from group chat
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Roles/GetRolesByGroupChat/${groupChatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRolesByGroupChat(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, [groupChatId, token]);
  // get members from group chat
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Users/GetUsersInGroupChat/${groupChatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsersInGroupChat(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, [groupChatId, token]);
  // create private channel
  const createPrivateChannel = async (e) => {
    e.preventDefault();
    const model = {
      groupChatId: groupChatId,
      channelName: channelName,
      userCreated: user.userId,
      roles: selectedRoles,
      users: selectedUsers,
    };
    const response = await axios.post(
      `${COMMON.API_BASE_URL}Channels/CreatePrivateChannel`,
      model, // Axios automatically stringifies JSON
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      onClose(true);
      groupChatHub.invoke("CreateChannel", response.data);
    }
    if (response.status === 401) {
      toast.error("Failed create channel: " + response.data, {
        position: "top-right",
        autoClose: 5000,
      });
      dispatch(clear(token));
    }
  };
  if (!isCreateChannelFormOpen) {
    return null;
  }
  return (
    <>
      <div
        className="overlay dFlex alignCenter justifyCenter"
        onClick={() => {
          onClose();
          setIsPrivate(false);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ padding: "3rem", borderRadius: "10%" }}
          className="bgFaded"
        >
          <div id="createChannelForm" className="dBlock">
            {/* public channel form */}
            <form onSubmit={createChannel}>
              <h2>Create Channel</h2>
              <p className="error textDanger"></p>
              <div className="inputGroup">
                <label htmlFor="channelName">Channel Name</label>
                <input
                  type="text"
                  id="channelName"
                  ref={channelNameRef}
                  placeholder="Enter channel name"
                  onChange={(e) => setChannelName(e.target.value)}
                />
              </div>
              <div className="inputGroup dFlex alignCenter">
                <input
                  style={{ width: "1rem" }}
                  type="checkbox"
                  id="isPrivate"
                  value="true"
                  checked={isPrivate}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isPrivate">Private channel</label>
              </div>
              {!isPrivate && (
                <div className="inputGroup">
                  <button type="submit" className="btn bgDanger">
                    Submit
                  </button>
                </div>
              )}
            </form>
            {isPrivate && (
              <div>
                <button
                  disabled={$("#channelName").val()?.trim() === ""}
                  className="btn bgSuccess"
                  onClick={() => {
                    handleNextButtonClick();
                    handlePrivateChannelForm();
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div id="createPrivateChannelForm" className="dNone">
            <form onSubmit={createPrivateChannel}>
              <h2>Add members or roles</h2>
              <div className="inputGroup dFlex alignCenter">
                <input
                  type="text"
                  placeholder="Enter member's name or role's name"
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label>
                  <strong>Roles</strong>
                </label>
                {rolesByGroupChat.map((role, index) => (
                  <div
                    key={index}
                    className="dFlex alignCenter justifySpaceBetween"
                  >
                    <p style={{ color: role.color, fontWeight: "bold" }}>
                      {role.roleName}
                    </p>
                    <div>
                      <input
                        type="checkbox"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: "#5cb85c",
                        }}
                        checked={selectedRoles.includes(role.roleId)}
                        onChange={() => handleRolesCheckbox(role.roleId)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="inputGroup">
                <label>Members</label>
                {usersInGroupChat.map((user, index) => (
                  <div
                    key={index}
                    className="dFlex alignCenter justifySpaceBetween"
                  >
                    <p style={{ fontWeight: "bold" }}>{user.userName}</p>
                    <div>
                      <input
                        type="checkbox"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: "#5cb85c",
                        }}
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => handleUsersCheckbox(user.userId)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="inputGroup dFlex alignCenter justifySpaceBetween">
                <button
                  type="button"
                  className="btn bgSecondary textFaded"
                  onClick={handleBackButtonClick}
                >
                  Back
                </button>
                <button type="submit" className="btn bgSuccess textFaded">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Home() {
  const [isCreateGroupChatFormOpen, SetCreateGroupChatFormOpen] =
    useState(false);
  const [isCreateChannelFormOpen, SetCreateChannelFormOpen] = useState(false);
  const [isEditProfileFormOpen, setEditProfileForm] = useState(false);
  const [isEditGroupChatFormOpen, setEditGroupChatForm] = useState(false);
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [isChannelClicked, setChannelClick] = useState(false);
  const [isHomeBtnClicked, setHomeBtnClick] = useState(false);
  const [groupChatId, setGroupChatId] = useState(null);
  const [channel, setChannel] = useState(null);
  const [groupChat, setGroupChat] = useState(null);
  const [toggleBigForms, setToggleBigForms] = useState(1);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [userHub, setUserHub] = useState(null);
  const hubInitialized = useRef(false);
  const handleGroupChatClick = (id) => {
    setGroupChatClick(true);
    setChannelClick(false);
    setGroupChatId(id);
    setHomeBtnClick(false);
  };
  const handleToggleBigForms = (value) => {
    setToggleBigForms(value);
  };
  useEffect(() => {
    let hubConnection = null;
    const createHub = async () => {
      try {
        // Only create the hub if we have a token and haven't initialized it yet
        if (token && !hubInitialized.current) {
          // Prevent additional initialization attempts
          hubInitialized.current = true;
          console.log("Creating hub connection...");
          const hub = await createUserHub(token, dispatch);

          if (hub) {
            console.log("Hub created, invoking OnConnected...");
            await hub.invoke("OnConnected", user.username);
            setUserHub(hub);
            hubConnection = hub;
          }
        }
      } catch (err) {
        // Reset initialization flag on error to allow retrying
        hubInitialized.current = false;
        console.error("Error invoking OnConnected:", err);
      }
    };
    if (token && !userHub) {
      createHub();
    }
    // Cleanup function
    return () => {
      if (hubConnection) {
        hubConnection.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [token, user?.username, dispatch, setUserHub, userHub]);
  // Redirect if token is cleared or expired
  if (!token) {
    if (userHub) {
      userHub.stop(); // Stop SignalR connection if token is cleared
    }
    return <Navigate to={"/"} />;
  }

  switch (toggleBigForms) {
    case 1:
      return (
        <UserHubContext.Provider value={userHub}>
          <div className="dFlex" style={{ height: "100vh" }}>
            <div
              className={"bgBlack1 leftSided dFlex alignCenter"}
              style={{
                overflowY: "auto",
                minWidth: "70px",
                flexDirection: "column",
                height: "100vh",
                gap: "8px",
              }}
            >
              <div>
                <button
                  className="btn bgBlack3 textFaded"
                  onClick={() => {
                    setHomeBtnClick(true);
                    setGroupChatClick(false);
                  }}
                >
                  <IoHomeSharp />
                </button>
              </div>
              <GroupChatsContainer
                handleGroupChatClick={handleGroupChatClick}
              />
              <button
                className="btnSmall btnSmallRounded bgSuccess"
                onClick={() =>
                  SetCreateGroupChatFormOpen(!isCreateGroupChatFormOpen)
                }
              >
                <FaPlus />
              </button>
              <div style={{ marginTop: "auto" }}>
                <div
                  id="optbtnSmalls"
                  className="posAbsolute"
                  style={{
                    display: "none",
                    bottom: "39.5px",
                    width: "68px",
                  }}
                >
                  <button
                    className="dBlock btnSmall bgInverse textFaded w100"
                    onClick={() => {
                      dispatch(clear(token));
                    }}
                  >
                    <span className="dFlex alignCenter justifyEvenly">
                      Log out <RiLogoutBoxRLine />
                    </span>
                  </button>
                  <button
                    className="dBlock btnSmall bgSecondary textInverse w100"
                    onClick={() => setEditProfileForm(true)}
                  >
                    <span className="dFlex alignCenter justifyEvenly">
                      Edit profile <FaCog />
                    </span>
                  </button>
                </div>
                <div>
                  <button
                    className="btnSmall bgFaded textInverse w100"
                    onClick={() => {
                      $("#optbtnSmalls").toggle();
                    }}
                  >
                    <span className="dFlex alignCenter justifyEvenly">
                      <img
                        alt="img"
                        src={user.avatar}
                        className="avatarCircle"
                        style={{ "--avatar-size": "25px" }}
                      />
                      <IoIosOptions />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div
              className={"bgBlack2 rightSided"}
              style={{ overflowY: "overlay" }}
            >
              {/* chat content here */}
              {isGroupChatClicked ? (
                <GroupChatContent
                  groupChatId={groupChatId}
                  isGroupChatClicked={isGroupChatClicked}
                  isHomeBtnClicked={isHomeBtnClicked}
                  isChannelClicked={isChannelClicked}
                  setCreateChannelFormOpen={SetCreateChannelFormOpen}
                  setGroupChatClick={setGroupChatClick}
                  setChannelClick={setChannelClick}
                  handleToggleBigForms={handleToggleBigForms}
                  channel={channel}
                  setChannel={setChannel}
                  groupChat={groupChat}
                  setGroupChat={setGroupChat}
                  setEditGroupChatForm={setEditGroupChatForm}
                />
              ) : (
                <HomePageContent userHub={userHub} />
              )}
            </div>
          </div>
          <CreateGroupChatForm
            isCreateGroupChatFormOpen={isCreateGroupChatFormOpen}
            onClose={() => SetCreateGroupChatFormOpen(false)}
          />
          <CreateChannelForm
            isCreateChannelFormOpen={isCreateChannelFormOpen}
            onClose={() => SetCreateChannelFormOpen(false)}
            groupChatId={groupChatId}
            token={token}
          />
          <EditProfileForm
            isEditProfileFormOpen={isEditProfileFormOpen}
            onClose={() => setEditProfileForm(false)}
            user={user}
            token={token}
          />
        </UserHubContext.Provider>
      );
    case 2:
      return (
        <EditChannelForm
          handleToggleBigForms={handleToggleBigForms}
          channel={channel}
        />
      );
    case 3:
      return (
        <EditGroupChatForm
          handleToggleBigForms={handleToggleBigForms}
          groupChat={groupChat}
        />
      );
    default:
      break;
  }
}

export default Home;
