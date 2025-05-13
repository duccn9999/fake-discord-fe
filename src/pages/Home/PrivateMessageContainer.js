import React, { useState, useRef } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import $ from "jquery";
import axios from "axios";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import COMMON from "../../utils/Common";
import PrivateMessage from "./PrivateMessage";
import { GET_MESSAGES } from "../../reducers/messagesReducer";
const PrivateMessageContainer = ({ friend, userHub }) => {
  const [message, setMessage] = useState("");
  const [previewAttachments, setPreviewAttachments] = useState([]);
  // Store the actual file objects separately from the preview URLs
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const token = useSelector((state) => state.token.value);
  const messages = useSelector((state) => state.messages.value);
  const user = useJwtDecode(token);
  const messagesRef = useRef(null);
  const dispatch = useDispatch();
  // make scrollbar at the bottom by default
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  const removeAttachment = (index) => {
    setPreviewAttachments((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
    setAttachmentFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    // Store the actual files
    setAttachmentFiles((prevFiles) => [...prevFiles, ...files]);
    // Create preview URLs for display
    const newPreviewAttachments = files.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewAttachments([...previewAttachments, ...newPreviewAttachments]);
  };

  // get messages
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}PrivateMessages/GetPrivateMsgesPagination/${friend.userId1}/${friend.userId2}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(GET_MESSAGES(response.data));
      })
      .catch((err) => {
        Error(err);
      });
  }, [token, friend.userId1, friend.userId2, dispatch]);

  // send messages
  const sendMessage = async (e) => {
    e.preventDefault();
    const messageForm = new FormData();
    messageForm.append("content", message);
    /* userFriends' rule is userId1 < userId2, so receiver and sender must be 
    find by determine if userId is userId1 or userId2  */
    messageForm.append(
      "receiver",
      user.userId == friend.userId1 ? friend.userId2 : friend.userId1
    );
    messageForm.append(
      "userId",
      user.userId == friend.userId1 ? friend.userId1 : friend.userId2
    );

    // Append each image file (not URL) to the form data
    if (attachmentFiles && attachmentFiles.length > 0) {
      attachmentFiles.forEach((file) => {
        messageForm.append("attachments", file);
      });
    }

    await axios
      .post(
        `${COMMON.API_BASE_URL}PrivateMessages/CreatePrivateMessage`,
        messageForm,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub.invoke(
          "SendPrivateMessage",
          response.data,
          user.userId == friend.userId1 ? friend.userId1 : friend.userId2,
          user.userId == friend.userId1 ? friend.userId2 : friend.userId1
        );
        setMessage("");
        setPreviewAttachments([]);
        setAttachmentFiles([]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <h1 className="textFaded" style={{ margin: "auto" }}>
        {friend.userName}
      </h1>
      <div
        id="messageContainer"
        className="msgContainer textFaded dFlex"
        style={{
          padding: "0 1rem 0 1rem",
          overflowY: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column", // Change to normal column direction
        }}
        ref={messagesRef}
      >
        <div style={{ flexGrow: 1 }}></div>
        <div className="msgList" style={{ width: "100%" }}>
          {messages.map((message, index) => {
            return (
              <PrivateMessage key={index} message={message} userHub={userHub} />
            );
          })}
        </div>
      </div>
      <div className="posSticky" style={{ bottom: 0 }}>
        <div
          className="previewAttachments bgFaded"
          style={{
            padding: "1rem",
            display: previewAttachments.length > 0 ? "flex" : "none",
          }}
        >
          {/* make the images at the left by default, it currently center */}
          {previewAttachments.map((image, index) => (
            <div
              key={index}
              style={{ display: "inline-block", position: "relative" }}
            >
              <img
                src={image}
                alt={`Preview ${index}`}
                style={{ maxWidth: "77px", maxHeight: "77px", margin: "0 5px" }}
              />
              <button
                onClick={() => removeAttachment(index)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
        <div>
          <form className="dFlex" onSubmit={sendMessage}>
            <div className="w100 dFlex alignCenter">
              <div>
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleAttachmentUpload}
                  style={{ display: "none" }}
                />
                <div
                  className="attachmentUploadBtn"
                  onClick={() => $("#fileInput").click()}
                >
                  <MdOutlineUploadFile color="white" />
                </div>
              </div>
              <input
                type="text"
                className="dBlock"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                id="msgInput"
              />
            </div>
            <button className="btn bgSuccess">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrivateMessageContainer;
