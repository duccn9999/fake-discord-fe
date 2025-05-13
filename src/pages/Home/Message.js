import { SlOptions } from "react-icons/sl";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import useJwtDecode from "../../hooks/jwtDecode";
import axios from "axios";
import $ from "jquery";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { GoTrash } from "react-icons/go";
import { useState } from "react";
import Modal from "../Modal/Modal";
import {ChannelHubContext} from "../../Contexts/channelHubContext";
import { useMentionHandler } from "../../hooks/userMentionHandler";
export function Message({
  messageValue,
  suggestions,
  roles,
  usersInGroupChat,
}) {
  const token = useSelector((state) => state.token.value);
  const permissions = useSelector((state) => state.permissions.value);
  const channelHub = useContext(ChannelHubContext);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [messageId, setMessageId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [modalText, setModalText] = useState("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const {
    message,
    setMessage,
    showSuggestions,
    mentionUsers,
    handleInputChange,
    insertMention,
    inputRef,
  } = useMentionHandler(roles, usersInGroupChat);

  useEffect(() => {
    setMessage(messageValue.content);
  }, [messageValue.content]); // Only run when messageValue.content changes
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
  const handleEdit = () => {
    setMessageId(messageValue.messageId);
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setMessage(messageValue.content);
  };
  const handleDelete = () => {
    if (deleteAction) {
      deleteAction(); // Execute the stored function
    }
    setShowModal(false);
  };
  const confirmDelete = (deleteFunc, modalText) => {
    setDeleteAction(() => deleteFunc); // Store the function to call
    setModalText(modalText);
    setShowModal(true);
  };
  // Edit message
  const updatedMessage = {
    MessageId: messageId,
    Content: message,
    ChannelId: messageValue.channelId,
    mentionUsers: mentionUsers,
  };
  const updateMessage = async (e) => {
    e.preventDefault();
    axios
      .put(`${COMMON.API_BASE_URL}Messages/UpdateMessage`, updatedMessage, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      })
      .then((response) => {
        handleCancel();
        $(`.optionsBtn${messageId}`).hide();
        channelHub.invoke("UpdateMessage", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //Delete message
  const deleteMessage = async (messageId) => {
    const response = await axios
      .delete(`${COMMON.API_BASE_URL}Messages/DeleteMessage/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        channelHub.invoke("DeleteMessage", response.data);
      })
      .catch((err) => {
        console.log("Error: ", err);
        dispatch(clear(token));
      });
    return response;
  };
  // Delete attachments
  const deleteAttachment = async (attachmentId) => {
    const response = await axios
      .delete(
        `${COMMON.API_BASE_URL}Messages/DeleteMessageAttachment/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        channelHub.invoke("UpdateMessage", response.data);
      })
      .catch((err) => {
        console.log("Error: ", err);
        dispatch(clear(token));
      });
    return response;
  };
  return (
    <div
      className={`messageItem`}
      id={`message${messageValue.messageId}`}
      style={{ textAlign: "left" }}
      onMouseEnter={() => {
        $(`.msgOptionsBtnWrapper${messageValue.messageId}`).show();
      }}
      onMouseLeave={() => {
        $(`.msgOptionsBtnWrapper${messageValue.messageId}`).hide();
      }}
    >
      <div className={"dFlex alignCenter  justifyFlexStart"}>
        <img
          className="avatarCircle"
          style={{ "--avatar-size": "40px" }}
          src={messageValue.avatar}
          alt="avt"
        />
        <h3 style={{ marginTop: 0 }}>
          {messageValue.username} <small>{messageValue.dateCreated}</small>
        </h3>
        <p className="dNone">{messageValue.messageId}</p>
        {(user.username === messageValue.username ||
          permissions?.includes("CanManageMessages")) && (
          <div
            style={{ marginLeft: "auto" }}
            className={`posRelative dNone msgOptionsBtnWrapper${messageValue.messageId}`}
          >
            <button
              className="btn"
              style={{ padding: 5 }}
              onClick={() => {
                $(`.optionsBtn${messageValue.messageId}`).toggle();
              }}
            >
              <SlOptions />
            </button>
            <div
              className={`optionsBtn${messageValue.messageId} posAbsolute`}
              style={{ display: "none", zIndex: 100 }}
            >
              {/* Only show edit button if the user owns the message */}
              {user.username === messageValue.username && (
                <button
                  className="btn bgPrimary textFaded dBlock"
                  style={{ padding: 5 }}
                  onClick={() => {
                    handleEdit();
                    $(`.msgOptionsBtnWrapper${messageValue.messageId}`).hide();
                  }}
                >
                  <FaRegEdit />
                </button>
              )}

              {/* Delete button is shown to both owners and authorized users */}
              <button
                className="btn bgDanger textFaded"
                style={{ padding: 5 }}
                onClick={() => {
                  confirmDelete(
                    () => deleteMessage(messageValue.messageId),
                    "Do you want to delete this message?"
                  );
                }}
              >
                <MdDeleteOutline />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="messageContent">
        {isEditing ? (
          <>
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
                          color: suggestion.color
                            ? suggestion.color
                            : "inherit",
                        }}
                      >
                        @{suggestion.userName || suggestion.roleName}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                padding: "10px 10px 50px 10px",
                borderRadius: "10px",
              }}
              className="bgBlack1"
            >
              <textarea
                style={{ resize: "none", height: "2rem" }}
                value={message}
                onChange={handleInputChange}
                rows={1}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                className="w100"
              />
              <div style={{ float: "right" }} className="dFlex">
                <button
                  className="btn bgDanger textFaded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn bgPrimary textFaded"
                  onClick={updateMessage}
                >
                  Update
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="messageText" style={{ marginTop: "10px" }}>
            <StyleMessage message={message} suggestions={suggestions} />
          </div>
        )}
        {messageValue.attachments && (
          <div
            className="messageImageContainer dFlex"
            style={{ marginTop: "10px" }}
          >
            {messageValue.attachments?.map((attachment, index) => (
              <div
                key={index}
                style={{ position: "relative", width: "fit-content" }}
              >
                {(() => {
                  switch (attachment.contentType) {
                    case "image":
                      return (
                        <img
                          src={attachment.url}
                          alt={`${index}`}
                          className="messageImage"
                          style={{
                            maxWidth: "180px",
                            maxHeight: "100px",
                            borderRadius: "10px",
                          }}
                        />
                      );
                    default:
                      return (
                        <div
                          style={{
                            height: "50px",
                            width: "150px",
                            backgroundColor: "wheat",
                            borderRadius: "10px",
                            padding: "6px",
                          }}
                          className="dFlex alignCenter textInverse"
                        >
                          <FaRegFileAlt />
                          other file
                        </div>
                      );
                  }
                })()}
                <div
                  className="dFlex"
                  style={{ position: "absolute", right: 0, top: 0 }}
                >
                  <a
                    href={`${attachment.downloadLink}`}
                    className=" btnSmall bgInverse textFaded"
                    style={{ textDecoration: "none" }}
                  >
                    <GoDownload style={{ width: "1rem", height: "1rem" }} />
                  </a>
                  {user.username === messageValue.username ? (
                    <button
                      className="btnSmall bgDanger textFaded"
                      onClick={() => {
                        confirmDelete(
                          () => deleteAttachment(attachment.attachmentId),
                          "Do you want to delete this attachment?"
                        );
                      }}
                    >
                      <GoTrash style={{ width: "1rem", height: "1rem" }} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        message={modalText}
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
function StyleMessage({ message, suggestions }) {
  const messagePart = message.split(/(@\w+)/g);
  const messageWithMentions = messagePart
    .map((part, index) => {
      if (part.startsWith("@")) {
        const mentionText = part.slice(1); // Remove the '@' character
        const suggestion = suggestions.find(
          (s) => s.roleName === mentionText || s.userName === mentionText
        );
        if (suggestion) {
          const textColor = suggestion.color || "#afb5f9";
          const backgroundColor = HexToRgba(textColor, 0.2);
          return `<span class="mention btn" style="
            font-weight: bold;
            padding: 8px;
            border-radius: 1rem;
            background-color: ${backgroundColor};
            color: ${textColor};
          ">${part}</span>`;
        }
      }
      return part;
    })
    .join("");

  return (
    <div
      className="messageText"
      style={{ marginTop: "10px" }}
      dangerouslySetInnerHTML={{ __html: messageWithMentions }}
    />
  );
}
function HexToRgba(hex, alpha = 0.2) {
  if (!hex || typeof hex !== "string") return `rgba(0, 0, 0, ${alpha})`; // default to dim black
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
export default Message;
