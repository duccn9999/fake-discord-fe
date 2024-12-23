import homeStyles from "./Home.module.css";
import { FiAlignJustify } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import $ from "jquery";
import COMMON from "../../Common";
function OpenCreateGroupChatForm({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  // Handle preview image
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  // Create group chat process
  const createGroupChat = (e) => {
    e.preventDefault();
    $.ajax({
      url: `${COMMON.API_BASE_URL}GroupChat/Create`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ groupChatName, coverImage }),
      success: function (data) {
        console.log(data);
      },
      error: function (xhr, status, error) {
        console.error("Error:", xhr.responseText);
      },
    });
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
                className={homeStyles.coverImage}
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
                  onChange={(e) => setCoverImage(e.target.src)}
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
function ChatContainer({ isOpen, setOpen }) {
  const [joinedGroupChats, setJoinedGroupChats] = useState(null);
  let token = window.localStorage.getItem("session");
  // Handle display joined groupChat
  const loadJoinedGroupChats = useEffect(() => {
    $.ajax({
      url: `${COMMON.API_BASE_URL}/GroupChat/GetJoinedGroupChats/${token}`,
      type: "GET",
      contentType: "application/json",
      success: function (data) {
        setJoinedGroupChats(data);
      },
    });
  }, joinedGroupChats);
  if (!joinedGroupChats) {
    return;
  }
  return (
    <div className="chatsContainer" onLoad={loadJoinedGroupChats}>
      {joinedGroupChats.map((groupChat) => (
        <div key={groupChat.id} className={`${homeStyles.chatComponent}`}>
          <div className={`${homeStyles.avatar} dInlineBlock`}>
            <img src={groupChat.coverImage} />
          </div>
          <div className="dInlineBlock">
            <div className="chatName">
              <strong>{groupChat.name}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function Home({ session }) {
  const [isOpen, setOpen] = useState(false);
  if (!session) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div className="gridContainer posRelative">
        <div className={"bgHardBlack"}>
          <div>
            <FiAlignJustify />
          </div>
          <ChatContainer isOpen={isOpen} setOpen={setOpen} />
          <button
            className="btn btnRounded btnFaded"
            onClick={() => setOpen(!isOpen)}
          >
            <FaPlus />
          </button>
        </div>
        <div className={"bgSoftBlack"}></div>
      </div>
      <OpenCreateGroupChatForm isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}

export default Home;
