import Styles from "./Home.module.css";
import { FaPlus } from "react-icons/fa";
import { useEffect, useReducer, useRef, useState } from "react";
import $ from "jquery";
import COMMON from "../../utils/Common";
import MessageSectionNotFound from "../Errors/MessageSectionNotFound";
import { Channel } from "./Channel";
import { MessageContainer } from "./MessageContainer";
import useInfiniteScroll from "../../hooks/infiniteScroll";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import groupChatReducer, {
  initialState,
} from "../../reducers/groupChatReducer";
import createConnectionHub from "../../signalR/UserHub";
import useJwtDecode from "../../hooks/jwtDecode";
import { useSelector } from "react-redux";
function GroupChat({
  groupChat,
  setGroupChatClick,
  setGroupChatId,
  setChannelClick,
}) {
  return (
    <div
      className={`${Styles.chatComponent}`}
      onClick={() => {
        setGroupChatClick(true);
        setGroupChatId(groupChat.groupChatId);
        setChannelClick(false);
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
  const [state, dispatch] = useReducer(groupChatReducer, initialState);
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
  // Create group chat process
  const createGroupChat = async (e) => {
    e.preventDefault();
    // Upload image to Cloudinary
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "duccn123");
    data.append("cloud_name", "dywexvvcy");

    try {
      // Wait for the image upload to complete
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dywexvvcy/image/upload",
        data
      );
      const coverImage = await response.data; // Wait for the response to be parsed as JSON
      console.log("Image uploaded successfully:", coverImage);

      // After the image is uploaded, proceed with creating the group chat
      const GroupChat = {
        Name: groupChatName,
        CoverImage: coverImage.secure_url,
        userCreated: user.userId,
      };
      await axios
        .post(`${COMMON.API_BASE_URL}GroupChat/Create`, GroupChat, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(
          dispatch({
            type: "ADD",
            payload: GroupChat,
          })
        );
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
function GroupChatsContainer({
  setGroupChatClick,
  setGroupChatId,
  setChannelClick,
}) {
  const ITEMS = 7;
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode();
  // Handle display joined groupChat
  const fetchGroupChats = async (page) => {
    const response = await axios.get(
      `${COMMON.API_BASE_URL}GroupChat/GetJoinedGroupChatsPagination/${user.userId}?page=${page}&items=${ITEMS}`,
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
          setGroupChatClick={setGroupChatClick}
          setGroupChatId={setGroupChatId}
          setChannelClick={setChannelClick}
        />
      ))}
      {loading && <h3 className="textFaded">...</h3>}
      <div ref={loaderRef} style={{ height: "20px" }}></div>
    </div>
  );
}

function GroupChatContent({
  groupChatId,
  isGroupChatClicked,
  isChannelClicked,
  setChannelClick,
  setCreateChannelFormOpen,
}) {
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
            `${COMMON.API_BASE_URL}GroupChat/GetGroupChatById/${groupChatId}`,
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
        {isChannelClicked ? (
          <MessageContainer groupChat={groupChat} channel={channel} />
        ) : null}
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
      url: `${COMMON.API_BASE_URL}Channel/${groupChatId}`,
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
      `${COMMON.API_BASE_URL}Channel/CreateChannel`,
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
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [isChannelClicked, setChannelClick] = useState(false);
  const [groupChatId, setGroupChatId] = useState(null);
  const navigate = useNavigate();
  const user = useJwtDecode();
  const token = useSelector(state => state.token.value);
  const connectionRef = useRef(null);
  useEffect(() => {
    if (isTokenExpired) {
      navigate("/");
    }
    const connectionHub = async() => {
      const connection = await createConnectionHub(token);
      connectionRef.current = connection;
      try{
        await connection.invoke("OnConnected", user.username);
      }catch(err){
        console.error("Error invoking OnConnected:", err);
      }
    };
    connectionHub();
    return () => {
      if(connectionRef.current){
        connectionRef.current.stop();
        console.log("SignalR connection stopped.");
      }
    }
  }, [isTokenExpired, token]);
  return (
    <>
      <div className="gridContainer posRelative">
        <div className={"bgBlack1 leftSided"} style={{ overflowY: "auto" }}>
          <h3 className="textFaded">Hello, {user.username}!</h3>
          <GroupChatsContainer
            setGroupChatClick={setGroupChatClick}
            isGroupChatClicked={isGroupChatClicked}
            setGroupChatId={setGroupChatId}
            setChannelClick={setChannelClick}
          />
          <button
            className="btn btnRounded btnFaded"
            onClick={() =>
              SetCreateGroupChatFormOpen(!isCreateGroupChatFormOpen)
            }
          >
            <FaPlus />
          </button>
        </div>
        <div className={"bgBlack2 rightSided"}>
          {/* chat content here */}
          {isGroupChatClicked ? (
            <GroupChatContent
              groupChatId={groupChatId}
              isGroupChatClicked={isGroupChatClicked}
              isChannelClicked={isChannelClicked}
              setChannelClick={setChannelClick}
              setCreateChannelFormOpen={SetCreateChannelFormOpen}
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
      />
    </>
  );
}

export default Home;
