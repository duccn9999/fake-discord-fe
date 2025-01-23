import Styles from "./Home.module.css";
import { FaPlus } from "react-icons/fa";
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import $ from "jquery";
import COMMON from "../../utils/Common";
import MessageSectionNotFound from "../Errors/MessageSectionNotFound";
import { Channel } from "./Channel";
import { MessagesContainer } from "./MessageContainer";
import useInfiniteScroll from "../../hooks/infiniteScroll";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import groupChatReducer, {
  initialState,
} from "../../reducers/groupChatReducer";
import createConnectionHub from "../../signalR/UserHub";
import useJwtDecode from "../../hooks/jwtDecode";
import { useSelector } from "react-redux";
import useUploadImage from "../../hooks/uploadImage";

const ConnectionContext = createContext();
function GroupChat({ groupChat, handleGroupChatClick }) {
  return (
    <div
      className={`${Styles.chatComponent}`}
      onClick={() => {
        handleGroupChatClick(groupChat.groupChatId);
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
  const connection = useContext(ConnectionContext);
  let user = useJwtDecode();
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
  console.log("avatar ", coverImage);
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
      connection.invoke("GroupChatsRefresh");
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
              <button type="submit" className="btn btnDanger">
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
  const ITEMS = 7;
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode();
  // Handle display joined groupChat
  const fetchGroupChats = async (page) => {
    const response = await axios.get(
      `${COMMON.API_BASE_URL}GroupChats/GetJoinedGroupChatsPagination/${user.userId}?page=${page}&items=${ITEMS}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correctly set Authorization header
        },
      }
    );
    return response;
  };
  const {
    items: groupChats,
    loaderRef,
    loading,
    hasMore,
  } = useInfiniteScroll(fetchGroupChats);
  // Handle hover on groupChat
  if (!groupChats.length && !loading) {
    return <h2 className="textFaded">No Group Chats Found</h2>;
  }
  return (
    <div className="groupChatsContainer" id="groupChatsContainer">
      {groupChats.map((groupChat) => (
        <GroupChat
          key={groupChat.groupChatId}
          groupChat={groupChat}
          handleGroupChatClick={handleGroupChatClick}
        />
      ))}
      {loading && <h3 className="textFaded">...</h3>}
      <div ref={loaderRef} style={{ height: "20px" }}></div>
    </div>
  );
}
function EditProfileForm({ isEditProfileFormOpen, onClose, user }) {
  const updateProfile = null;
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
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
                value={user.username}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={user.email}
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
                  onChange={(e) => setUsername(e.target.value)}
                  value={user.password}
                />
              </div>
              <div className="inputGroup">
                <label htmlFor="reEnterNewPassword">
                  Enter new password again
                </label>
                <input
                  type="password"
                  id="reEnterNewPassword"
                  onChange={(e) => setUsername(e.target.value)}
                  value={user.password}
                />
              </div>
            </div>
            <div className="inputGroup">
              <button
                className="btn btnSuccess"
                onClick={(e) => {
                  e.preventDefault();
                  setChangePassword(!changePassword);
                }}
                id="changePwdBtn"
              >
                Change Password
              </button>
              <button type="submit" className="btn btnDanger">
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
  setCreateChannelFormOpen,
}) {
  const [isChannelClicked, setChannelClick] = useState(false);
  const [isChannelExist, setChannelExist] = useState(true);
  const [groupChat, setGroupChat] = useState(null);
  const [channel, setChannel] = useState(null);
  const token = useSelector((state) => state.token.value);
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
          if (response.status >= 200 && response.status < 300) {
            setGroupChat(response.data);
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error fetching group chat:", error.message);
        }
      } else {
        setGroupChat(null);
      }
    };

    fetchGroupChat();
  }, [groupChatId, isGroupChatClicked]);
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
          className="bgBlack3 textFaded borderNone"
          onClick={() => setCreateChannelFormOpen(true)}
        >
          Add Channels <FaPlus style={{ width: "10px", height: "10px" }} />
        </button>
        <ChannelsContainer
          groupChatId={groupChatId}
          setChannelExist={setChannelExist}
          setChannelClick={setChannelClick}
          setChannel={setChannel}
        />
      </div>
      <div className="content" style={{ position: "relative" }}>
        {!isChannelExist ? <MessageSectionNotFound /> : null}
        {isChannelClicked ? <MessagesContainer channel={channel} /> : null}
      </div>
    </>
  );
}
function ChannelsContainer({
  groupChatId,
  setChannelExist,
  setChannelClick,
  setChannel,
}) {
  const [channels, setChannels] = useState([]);
  useEffect(() => {
    $.ajax({
      url: `${COMMON.API_BASE_URL}Channels/${groupChatId}`,
      method: "GET",
      contentType: "application/json",
      success: function (data) {
        !data || data.length === 0
          ? setChannelExist(false)
          : setChannelExist(true);
        setChannels(data);
      },
      error: function (xhr, error, status) {
        console.log(xhr.responseText);
      },
    });
  }, [groupChatId, setChannelExist, channels.length]);
  if (!channels || channels.length === 0) {
    return null;
  }
  return channels.map((channel) => (
    <Channel
      key={channel.channelId}
      channel={channel}
      setChannelClick={setChannelClick}
      setChannel={setChannel}
    />
  ));
}
function CreateChannelForm({ isCreateChannelFormOpen, onClose, groupChatId }) {
  const [channelName, setChannelName] = useState(null);
  let user = useJwtDecode();
  const createChannel = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${COMMON.API_BASE_URL}Channels/CreateChannel`,
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
        },
        method: "POST",
        body: JSON.stringify({
          GroupChatId: groupChatId,
          ChannelName: channelName,
          UserCreated: user.userId,
        }),
      }
    );
    if (response) {
      console.log(response.json);
      onClose(true);
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
              <button type="submit" className="btn btnDanger">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
function Home({ isTokenExpired }) {
  const [isCreateGroupChatFormOpen, SetCreateGroupChatFormOpen] =
    useState(false);
  const [isCreateChannelFormOpen, SetCreateChannelFormOpen] = useState(false);
  const [isEditProfileFormOpen, setEditProfileForm] = useState(false);
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [groupChatId, setGroupChatId] = useState(null);
  const navigate = useNavigate();
  const user = useJwtDecode();
  const token = useSelector((state) => state.token.value);
  const connectionRef = useRef(null);
  const handleGroupChatClick = (id) => {
    setGroupChatClick(true);
    setGroupChatId(id);
  };
  useEffect(() => {
    if (isTokenExpired) {
      navigate("/");
    }
    const connectionHub = async () => {
      const connection = await createConnectionHub(token);
      connectionRef.current = connection;
      try {
        await connection.invoke("OnConnected", user.username);
      } catch (err) {
        console.error("Error invoking OnConnected:", err);
      }
    };
    connectionHub();
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log("SignalR connection stopped.");
      }
    };
  }, [isTokenExpired, token]);
  return (
    <ConnectionContext.Provider value={connectionRef.current}>
      <div className="gridContainer">
        <div
          className={"bgBlack1 leftSided posRelative"}
          style={{ overflowY: "auto" }}
        >
          <h3 className="textFaded">Hello, {user.username}!</h3>
          <GroupChatsContainer
            isGroupChatClicked={isGroupChatClicked}
            handleGroupChatClick={handleGroupChatClick}
          />
          <button
            className="btn btnRounded btnFaded"
            onClick={() =>
              SetCreateGroupChatFormOpen(!isCreateGroupChatFormOpen)
            }
          >
            <FaPlus />
          </button>
          <div className="posAbsolute" style={{ bottom: 0, width: "100%" }}>
            <button
              className="btn btnFaded textInverse"
              style={{ width: "100%" }}
              onClick={() => setEditProfileForm(true)}
            >
              <span className="dFlex alignCenter justifyEvenly">
                Edit profile <FaCog />
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
              setCreateChannelFormOpen={SetCreateChannelFormOpen}
            ></GroupChatContent>
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
      />
      <EditProfileForm
        isEditProfileFormOpen={isEditProfileFormOpen}
        onClose={() => setEditProfileForm(false)}
        user={user}
      />
    </ConnectionContext.Provider>
  );
}

export default Home;
