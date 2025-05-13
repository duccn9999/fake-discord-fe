import axios from "axios";
import { useEffect, useRef, useState, useMemo, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
import { GET_MESSAGES } from "../../reducers/messagesReducer";
import useJwtDecode from "../../hooks/jwtDecode";
import { Message } from "./Message";
import $ from "jquery";
import { MdOutlineUploadFile } from "react-icons/md";
import useGetUsersInGroupChatWithRoles from "../../hooks/getUsersInGroupChatWithRoles";
import { useMentionHandler } from "../../hooks/userMentionHandler";
import { useUpdateLastSeenMessage } from "../../hooks/updateLastSeenMessage";
import { useMarkMentionsAsRead } from "../../hooks/markMessageAsRead";
import { ChannelHubContext } from "../../Contexts/channelHubContext";
import useInfiniteScroll from "../../hooks/infiniteScroll";
export function MessagesContainer({ channel, groupChatId }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const messages = useSelector((state) => state.messages.value);
  const dispatch = useDispatch();
  const [previewAttachments, setPreviewAttachments] = useState([]);
  // Store the actual file objects separately from the preview URLs
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const updateLastSeenMessage = useUpdateLastSeenMessage();
  const markMentionsAsRead = useMarkMentionsAsRead();
  const messagesRef = useRef(null);
  const channelHub = useContext(ChannelHubContext);
  // get last seen message
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Messages/GetLastSeenMessage/${user.userId}/${channel.channelId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setLastMessage(response.data || null);
      });
  }, [token, user.userId, channel.channelId]);
  // preview attachments
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
  const removeAttachment = (index) => {
    setPreviewAttachments((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
    setAttachmentFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  // handle key
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (suggestions.length > 0) {
        e.preventDefault();
        insertMention(suggestions[selectedSuggestionIndex]);
      }
    }
  };

  // handle input change
  const usersInGroupChat = useGetUsersInGroupChatWithRoles(groupChatId);
  const roles = useMemo(
    () => Array.from(new Set(usersInGroupChat.flatMap((user) => user.roles))),
    [usersInGroupChat]
  );
  const combinedSuggestions = useMemo(
    () => [
      ...roles,
      ...usersInGroupChat.map((user) => ({
        userId: user.userId,
        userName: user.userName,
        avatar: user.avatar,
      })),
    ],
    [roles, usersInGroupChat]
  );

  const {
    message,
    setMessage,
    cursorPosition,
    setCursorPosition,
    mentionStart,
    setMentionStart,
    suggestionFilter,
    showSuggestions,
    suggestions,
    mentionUsers,
    handleInputChange,
    insertMention,
    inputRef,
  } = useMentionHandler(roles, usersInGroupChat);

  // make scrollbar at the bottom by default
  useEffect(() => {
    const chatContainer = messagesRef.current;
    if (!chatContainer) return;
    // Set scroll position to bottom by default
    scrollToLastRead();

    const handleScroll = async () => {
      if (lastMessage === null) return;
      const isAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop <=
        chatContainer.clientHeight + 5;
        console.log("isAtBottom: ", isAtBottom);
      if (isAtBottom && messages.length >= 0) {
        const newestId = messages[messages.length - 1].messageId;
        if (!lastMessage || newestId !== lastMessage.messageId) {
          // update the last seen message
          const updatedMessage = await updateLastSeenMessage(
            user.userId,
            channel.channelId,
            newestId,
            token
          );
          if (updatedMessage) {
            setLastMessage(updatedMessage);
          }
          // clear the notification count because user scrolled down to very end
          const readMentions = await markMentionsAsRead(
            user.userId,
            channel.channelId
          );
          if (readMentions) {
            channelHub.invoke(
              "MarkMentionsAsRead",
              user.username,
              channel.channelId
            );
          }
        }
      }
    };
    chatContainer.addEventListener("scroll", handleScroll);
    return () => chatContainer.removeEventListener("scroll", handleScroll);
  }, [
    messages,
    lastMessage,
    user.userId,
    channel.channelId,
    token,
    channelHub,
  ]);
  const scrollToLastRead = () => {
    if (lastMessage && messagesRef.current) {
      const el = document.getElementById(`message${lastMessage.messageId}`);
      if (el) {
        console.log("LETS GO ", el);
        el.scrollIntoView({ block: "start" });
      }
    } else {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }
  };
  // Display messages
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Messages/GetMessages/${channel.channelId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(GET_MESSAGES(response.data));
      });
  }, [token, channel.channelId, dispatch]);
  // use infinite scroll hook here
  // const { items } = useInfiniteScroll(messages, false);

  // Add message
  const sendMessage = async () => {
    const messageForm = new FormData();
    messageForm.append("userCreated", user.userId);
    messageForm.append("username", user.username);
    messageForm.append("avatar", user.avatar);
    messageForm.append("content", message);
    messageForm.append("channelId", channel.channelId);
    // Handle mentionUsers and mentionRoles safely
    (mentionUsers ?? []).forEach((id) => {
      messageForm.append("MentionUsers", id);
    });
    // Append each file (not URL) to the form data
    if (attachmentFiles && attachmentFiles.length > 0) {
      attachmentFiles.forEach((file) => {
        messageForm.append("attachments", file);
      });
    }
    const response = await axios
      .post(`${COMMON.API_BASE_URL}Messages/CreateMessage`, messageForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setPreviewAttachments([]);
        setAttachmentFiles([]);
        channelHub.invoke("SendMessage", response.data);
        channelHub.invoke("AddMentionCount", mentionUsers, channel.channelId);
      })
      .catch((err) => {
        console.log("Error: ", err);
        dispatch(clear(token));
      });
    return response;
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        width: "85%",
        flexDirection: "column",
      }}
    >
      <h1 className="textFaded" style={{ margin: "auto" }}>
        {channel.channelName}
      </h1>
      <div
        id="messagesContainer"
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
        {messages?.slice().map((message, index) => (
          <Message
            key={index}
            messageValue={message}
            groupChatId={groupChatId}
            suggestions={combinedSuggestions}
            roles={roles}
            usersInGroupChat={usersInGroupChat}
          />
        ))}
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
        {showSuggestions && suggestions.length > 0 && (
          <div>
            {/* Display suggestions here */}
            <div className="suggestionContainer textFaded">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestionItem ${
                    index === selectedSuggestionIndex ? "selected" : ""
                  }`}
                  onClick={() => insertMention(suggestion)}
                >
                  <strong
                    style={{
                      color: suggestion.color ? suggestion.color : "inherit",
                    }}
                  >
                    @{suggestion.userName || suggestion.roleName}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="dFlex">
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

          <textarea
            style={{ resize: "none" }}
            onChange={handleInputChange}
            className="dBlock w100"
            id="msgInput"
            rows={1}
            ref={inputRef}
            value={message}
            onKeyDown={handleKeyDown}
          />
          <button className="btn bgSuccess" onClick={sendMessage}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
