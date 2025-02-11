import Styles from "./Home.module.css";
import { FaPlus } from "react-icons/fa";
import { createContext, useContext, useEffect, useState } from "react";
import $ from "jquery";
import COMMON from "../../utils/Common";
import MessageSectionNotFound from "../Errors/MessageSectionNotFound";
import { Channel } from "./Channel";
import { MessagesContainer } from "./MessagesContainer";
import useInfiniteScroll from "../../hooks/infiniteScroll";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoIosOptions } from "react-icons/io";
import createUserHub from "../../signalR/userHub";
import createGroupChatHub from "../../signalR/groupChatHub";
import createChannelHub from "../../signalR/channelHub";
import useJwtDecode from "../../hooks/jwtDecode";
import { useDispatch, useSelector } from "react-redux";
import { GET_CHANNELS, ADD_CHANNEL } from "../../reducers/channelsReducer";
import useUploadImage from "../../hooks/uploadImage";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { clear } from "../../reducers/tokenReducer";
const UserHubContext = createContext();
const GroupChatHubContext = createContext();
const ChannelHubContext = createContext();
function GroupChat({ groupChat, handleGroupChatClick }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const groupChatHub = useContext(GroupChatHubContext);
  return (
    <div
      className={`${Styles.chatComponent}`}
      onClick={() => {
        handleGroupChatClick(groupChat.groupChatId);
        groupChatHub
          .invoke("OnEnterGroupChat", user.username, groupChat)
          .catch((err) => console.error("SignalR Error:", err));
      }}
    >
      <div className={`${Styles.avatar} dInlineBlock`}>
        <img src={groupChat.coverImage} alt={`img-${groupChat.groupChatId}`} />
      </div>
      <div className="dInlineBlock">
        <div className="chatName">
          <strong className="textFaded">{groupChat.name}</strong>
        </div>
      </div>
    </div>
  );
}
function CreateGroupChatForm({ isCreateGroupChatFormOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const groupChatHub = useContext(GroupChatHubContext);
  const token = useSelector((state) => state.token.value);
  let user = useJwtDecode(token);
  // Handle preview image
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => setPreview(undefined);
  }, [file]);
  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const coverImage = useUploadImage(file);
  const createGroupChat = async (e) => {
    e.preventDefault();
    try {
      // After the image is uploaded, proceed with creating the group chat
      const GroupChat = {
        Name: groupChatName,
        CoverImage: coverImage?.secure_url,
        userCreated: user.userId,
      };
      await axios.post(`${COMMON.API_BASE_URL}GroupChats/Create`, GroupChat, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      groupChatHub.invoke("OnRefreshGroupChats");
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
              <button type="submit" className="btn bgDanger">
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
  useEffect(() => {
    const createHub = async () => {
      try {
        const groupChatHub = await createGroupChatHub(token);
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
  // Handle hover on groupChat
  if (!groupChats.length) {
    return <h2 className="textFaded">No Group Chats Found</h2>;
  }
  return (
    <GroupChatHubContext.Provider value={groupChatHub}>
      <div className="groupChatsContainer" id="groupChatsContainer">
        {groupChats.map((groupChat) => (
          <GroupChat
            key={groupChat.groupChatId}
            groupChat={groupChat}
            handleGroupChatClick={handleGroupChatClick}
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
      $("#changePwdBtn").text("Undo");
    } else {
      $(".changePasswordWrapper").css("display", "none");
      $(".inputGroup:has(#password)").css("display", "block");
      $("#changePwdBtn").text("Change password");
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
                className="btn bgSuccess"
                onClick={(e) => {
                  e.preventDefault();
                  setChangePassword(!changePassword);
                }}
                id="changePwdBtn"
              >
                Change Password
              </button>
              <button type="submit" className="btn bgDanger">
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
  setCreateChannelFormOpen,
  setChannelClick,
}) {
  const [isChannelExist, setChannelExist] = useState(true);
  const [groupChat, setGroupChat] = useState(null);
  const [channel, setChannel] = useState(null);
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
  return (
    <>
      <div className="header bgBlack3">
        <h3 className={`textFaded ${Styles.groupChatTitle}`}>
          {groupChat ? groupChat.name : "loading..."}
        </h3>
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
        />
      </div>
      <div
        className="content dGrid"
        style={{ gridTemplateRows: "auto auto 1fr", height: "100vh" }}
      >
        {!isChannelExist ? <MessageSectionNotFound /> : null}
        {isChannelClicked ? (
          <MessagesContainer channel={channel} channelHub={channelHub} />
        ) : null}
      </div>
    </>
  );
}
function ChannelsContainer({
  groupChatId,
  setChannelExist,
  setChannelClick,
  channelTracker,
  channelHub,
}) {
  const channels = useSelector((state) => state.channels.value);
  const dispatch = useDispatch();
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Channels/${groupChatId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
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
        {channels.map((channel) => (
          <Channel
            key={uuidv4()}
            channel={channel}
            setChannelClick={setChannelClick}
            channelTracker={channelTracker}
            channelHub={channelHub}
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
  let user = useJwtDecode(token);
  const createChannel = async (e) => {
    e.preventDefault();
    const model = {
      GroupChatId: groupChatId,
      ChannelName: channelName,
      UserCreated: user.userId,
    };
    const response = await axios.post(
      `${COMMON.API_BASE_URL}Channels/CreateChannel`,
      model, // Axios automatically stringifies JSON
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
        },
      }
    );
    if (response.status === 201) {
      const data = response.data;
      onClose(true);
      dispatch(ADD_CHANNEL(data));
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
      <div className="overlay" onClick={onClose}>
        <div
          className="formContainer posAbsolute centerWithTransform"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={createChannel} className="form">
            <h2>Create Channel</h2>
            <p className="error textDanger"></p>
            <div className="inputGroup">
              <label htmlFor="channelName">Channel Name</label>
              <input
                type="text"
                id="channelName"
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>
            <div className="inputGroup">
              <button type="submit" className="btn bgDanger">
                Submit
              </button>
            </div>
          </form>
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
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [isChannelClicked, setChannelClick] = useState(false);
  const [groupChatId, setGroupChatId] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [userHub, setUserHub] = useState(null);
  const handleGroupChatClick = (id) => {
    setGroupChatClick(true);
    setChannelClick(false);
    setGroupChatId(id);
  };
  useEffect(() => {
    const createHub = async () => {
      try {
        if (token) {
          const hub = await createUserHub(token);
          hub.invoke("OnConnected", user.username);
          setUserHub(hub);
        }
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    createHub();
    return () => {
      if (userHub) {
        userHub.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [token]);
  // Redirect if token is cleared or expired
  if (!token) {
    if (userHub) {
      userHub.stop(); // Stop SignalR connection if token is cleared
    }
    return <Navigate to="/" />;
  }
  return (
    <UserHubContext.Provider value={userHub}>
      <div className="gridContainer">
        <div
          className={"bgBlack1 leftSided posRelative"}
          style={{ overflowY: "auto" }}
        >
          <h3 className="textFaded">Hello, {user.username}!</h3>
          <GroupChatsContainer handleGroupChatClick={handleGroupChatClick} />
          <button
            className="btn btnRounded bgSuccess"
            onClick={() =>
              SetCreateGroupChatFormOpen(!isCreateGroupChatFormOpen)
            }
          >
            <FaPlus />
          </button>
          <div className="posSticky" style={{ bottom: 0, width: "100%" }}>
            <div id="optBtns" style={{ display: "none" }}>
              <button
                className="btn bgInverse textFaded w100"
                onClick={() => {
                  dispatch(clear(token));
                }}
              >
                <span className="dFlex alignCenter justifyEvenly">
                  Log out <RiLogoutBoxRLine />
                </span>
              </button>
              <button
                className="btn bgSecondary textInverse w100"
                onClick={() => setEditProfileForm(true)}
              >
                <span className="dFlex alignCenter justifyEvenly">
                  Edit profile <FaCog />
                </span>
              </button>
            </div>
            <button
              className="btn bgFaded textInverse w100"
              onClick={() => $("#optBtns").toggle()}
            >
              <span className="dFlex alignCenter justifyEvenly">
                <img
                  alt="img"
                  src={user.avatar}
                  className="avatarCircle"
                  style={{ "--avatar-size": "25px" }}
                />
                Options
                <IoIosOptions />
              </span>
            </button>
          </div>
        </div>
        <div className={"bgBlack2 rightSided"}>
          {/* chat content here */}
          {isGroupChatClicked ? (
            <GroupChatContent
              groupChatId={groupChatId}
              isGroupChatClicked={isGroupChatClicked}
              isChannelClicked={isChannelClicked}
              setCreateChannelFormOpen={SetCreateChannelFormOpen}
              setGroupChatClick={setGroupChatClick}
              setChannelClick={setChannelClick}
            />
          ) : null}
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
}

export default Home;
