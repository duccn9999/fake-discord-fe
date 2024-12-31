import Styles from "./Home.module.css";
import { Navigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import $ from "jquery";
import COMMON from "../../Common";
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
function GroupChatsContainer({ setClick, setGroupChatId }) {
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
        <div
          key={groupChat.groupChatId}
          className={`${Styles.chatComponent}`}
          onClick={() => {
            setClick(true);
            setGroupChatId(groupChat.groupChatId);
          }}
        >
          <div className={`${Styles.avatar} dInlineBlock`}>
            <img
              src={groupChat.coverImage}
              alt={`img-${groupChat.groupChatId}`}
            />
          </div>
          <div className="dInlineBlock">
            <div className="chatName">
              <strong className="textFaded">{groupChat.name}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function ChannelsContainer({ groupChatId }) {
  const [channels, setChannels] = useState(null);
  useEffect(() => {
    $.ajax({
      url: `${COMMON.API_BASE_URL}Channels/${groupChatId}`,
      method: "GET",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        setChannels(data);
      },
      error: function (xhr, error, status) {
        console.log(xhr.responseText);
      },
    });
  }, [groupChatId]);
  if(!channels){
    return;
  }
  return channels.map((channel) => 
  <div key={channel.channelId}>
    <button className="bgBlack4 textFaded">{channel.channelName}</button>    
  </div>);
}
function GroupChatContent({ id, isDisplay }) {
  const [groupChat, setGroupChat] = useState(null);
  useEffect(() => {
    if (!id) {
      return;
    }
  }, [id]);
  if (!isDisplay) {
    return;
  }
  return (
    <>
      <div className="header bgBlack3">
        <h3 className={`textFaded ${Styles.groupChatTitle}`}>{id}</h3>
        <button className="bgBlack3 textFaded borderNone">Add Channels <FaPlus style={{width: "10px", height: "10px"}}/></button>
        <ChannelsContainer groupChatId={id}/>
      </div>
      <div className="content"></div>
    </>
  );
}
function Home({ session }) {
  const [isOpen, setOpen] = useState(false);
  const [isClicked, setClick] = useState(false);
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
            isClicked={isClicked}
            setClick={setClick}
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
          <GroupChatContent id={groupChatId} isDisplay={isClicked} />
        </div>
      </div>
      <CreateGroupChatForm isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}

export default Home;
