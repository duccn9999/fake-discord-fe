import { SlOptions } from "react-icons/sl";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import axios from "axios";
import $ from "jquery";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
import useRolePermissionsOfUserInGroupChat from "../../hooks/rolePermissionsOfUserInGroupChat";
import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { GoTrash } from "react-icons/go";
import { useState } from "react";
import Modal from "../Modal/Modal";
export function Message({ message, channelHub, groupChatId, suggestions }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const permissions = useRolePermissionsOfUserInGroupChat(groupChatId);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [messageId, setMessageId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [modalText, setModalText] = useState("");
  const handleEdit = () => {
    setEditValue(message.content);
    setMessageId(message.messageId);
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
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
    Content: editValue,
    ChannelId: message.channelId,
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
        setEditValue("");
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
      id={`message${message.messageId}`}
      style={{ textAlign: "left" }}
      onMouseEnter={() => {
        $(`.msgOptionsBtnWrapper${message.messageId}`).show();
      }}
      onMouseLeave={() => {
        $(`.msgOptionsBtnWrapper${message.messageId}`).hide();
      }}
    >
      <div className={"dFlex alignCenter  justifyFlexStart"}>
        <img
          className="avatarCircle"
          style={{ "--avatar-size": "40px" }}
          src={message.avatar}
          alt="avt"
        />
        <h3 style={{ marginTop: 0 }}>
          {message.username} <small>{message.dateCreated}</small>
        </h3>
        <p className="dNone">{message.messageId}</p>
        {(user.username === message.username ||
          permissions?.includes("CanManageMessages")) && (
          <div
            style={{ marginLeft: "auto" }}
            className={`posRelative dNone msgOptionsBtnWrapper${message.messageId}`}
          >
            <button
              className="btn"
              style={{ padding: 5 }}
              onClick={() => {
                $(`.optionsBtn${message.messageId}`).toggle();
              }}
            >
              <SlOptions />
            </button>
            <div
              className={`optionsBtn${message.messageId} posAbsolute`}
              style={{ display: "none", zIndex: 100 }}
            >
              {/* Only show edit button if the user owns the message */}
              {user.username === message.username && (
                <button
                  className="btn bgPrimary textFaded dBlock"
                  style={{ padding: 5 }}
                  onClick={() => {
                    handleEdit();
                    $(`.msgOptionsBtnWrapper${message.messageId}`).hide();
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
                    () => deleteMessage(message.messageId),
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
          <div
            style={{
              padding: "10px 10px 50px 10px",
              borderRadius: "10px",
            }}
            className="bgBlack1"
          >
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
            />
            <div style={{ float: "right" }} className="dFlex">
              <button className="btn bgDanger textFaded" onClick={handleCancel}>
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
        ) : (
          <div className="messageText" style={{ marginTop: "10px" }}>
            <StyleMessage message={message.content} suggestions={suggestions} />
          </div>
        )}
        {message.attachments && (
          <div
            className="messageImageContainer dFlex"
            style={{ marginTop: "10px" }}
          >
            {message.attachments?.map((attachment, index) => (
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
                  {user.username === message.username ? (
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
