import Styles from "./Home.module.css";
import { Navigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import $ from "jquery";
import COMMON from "../../Common";
import MessageSectionNotFound from "../Errors/MessageSectionNotFound";
function GroupChat({ groupChat, setGroupChatClick, setGroupChatId }) {
  return (
    <div
      key={groupChat.groupChatId}
      className={`${Styles.chatComponent}`}
      onClick={() => {
        setGroupChatClick(true);
        setGroupChatId(groupChat.groupChatId);
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
function CreateGroupChatForm({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  let user = COMMON.JwtDecode();
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
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dywexvvcy/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const coverImage = await response.json(); // Wait for the response to be parsed as JSON
      console.log("Image uploaded successfully:", coverImage);

      // After the image is uploaded, proceed with creating the group chat
      $.ajax({
        url: `${COMMON.API_BASE_URL}GroupChat/Create`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          Name: groupChatName,
          CoverImage: coverImage.secure_url, // Use the uploaded image URL
          userCreated: user.id,
        }),
        success: function (data) {
          console.log(data);
          onClose(true); // Close the modal or perform any other actions
        },
        error: function (xhr, status, error) {
          $(".error").html(`Error creating group chat: ${xhr.responseText}`);
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      $(".error").html(`Error uploading image: ${error.message}`);
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div
          className="formContainer posAbsolute centerWithTransform"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={createGroupChat}>
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
function GroupChatsContainer({ setGroupChatClick, setGroupChatId }) {
  const [joinedGroupChats, setJoinedGroupChats] = useState(null);
  let user = COMMON.JwtDecode();
  // Handle display joined groupChat
  useEffect(() => {
    $.ajax({
      url: `${COMMON.API_BASE_URL}GroupChat/GetJoinedGroupChats/${user.id}`,
      type: "GET",
      contentType: "application/json",
      success: function (data) {
        setJoinedGroupChats(data);
      },
      error: function (error) {
        console.error("Error fetching joined group chats:", error);
      },
    });
  }, [joinedGroupChats, user.id]);
  // Handle hover on groupChat
  if (!joinedGroupChats) {
    return;
  }
  return (
    <div className="groupChatsContainer">
      {joinedGroupChats.map((groupChat) => (
        <GroupChat
          key={groupChat.groupChatId}
          groupChat={groupChat}
          setGroupChatClick={setGroupChatClick}
          setGroupChatId={setGroupChatId}
        />
      ))}
    </div>
  );
}

function GroupChatContent({ groupChatId, isGroupChatClicked }) {
  const [isChannelExist, setChannelExist] = useState(true);
  const [isChannelClicked, setChannelClick] = useState(false);
  const [groupChat, setGroupChat] = useState(null);
  useEffect(() => {
    const fetchGroupChat = async () => {
      if (isGroupChatClicked && groupChatId) {
        try {
          console.log(`Fetching group chat with ID: ${groupChatId}`);
          const response = await fetch(`${COMMON.API_BASE_URL}GroupChat/GetGroupChatById/${groupChatId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          console.log("GroupChat data fetched:", data);
          setGroupChat(data);
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
        <h3 className={`textFaded ${Styles.groupChatTitle}`}>{groupChat ? groupChat.name : "loading..."}</h3>
        <button className="bgBlack3 textFaded borderNone">
          Add Channels <FaPlus style={{ width: "10px", height: "10px" }} />
        </button>
        <ChannelsContainer
          groupChatId={groupChatId}
          setChannelExist={setChannelExist}
          setChannelClick={setChannelClick}
        />
      </div>
      <div className="content">
        {!isChannelExist ? <MessageSectionNotFound /> : null}
        {isChannelClicked ? <MessageContainer groupChat={groupChat}/> : null}
      </div>
    </>
  );
}
function Channel({ channel, setChannelClick }) {
  return (
    <div>
      <button
        className="bgBlack4 textFaded"
        onClick={() => setChannelClick(true)}
      >
        {channel.channelName}
      </button>
    </div>
  );
}
function ChannelsContainer({ groupChatId, setChannelExist, setChannelClick }) {
  const [channels, setChannels] = useState(null);
  useEffect(() => {
    $.ajax({
      url: `${COMMON.API_BASE_URL}Channels/${groupChatId}`,
      method: "GET",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        !data || data.length === 0
          ? setChannelExist(false)
          : setChannelExist(true);
        setChannels(data);
      },
      error: function (xhr, error, status) {
        console.log(xhr.responseText);
      },
    });
  }, [groupChatId, setChannelExist]);
  if (!channels || channels.length === 0) {
    return;
  }
  return channels.map((channel) => (
    <Channel
      key={channel.channelId}
      channel={channel}
      setChannelClick={setChannelClick}
    />
  ));
}
function MessageContainer({groupChat}) {
  return <h1>{groupChat.name}</h1>;
}
function Home({ session }) {
  const [isOpen, setOpen] = useState(false);
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [groupChatId, setGroupChatId] = useState();
  let user = COMMON.JwtDecode();
  if (!session) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div className="gridContainer posRelative">
        <div className={"bgBlack1 leftSided"}>
          <h3 className="textFaded">Hello, {user.username}!</h3>
          <GroupChatsContainer
            setGroupChatClick={setGroupChatClick}
            isGroupChatClicked={isGroupChatClicked}
            setGroupChatId={setGroupChatId}
          />
          <button
            className="btn btnRounded btnFaded"
            onClick={() => setOpen(!isOpen)}
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
            />
          ) : null}
        </div>
      </div>
      <CreateGroupChatForm isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}

export default Home;
