import { SlOptions } from "react-icons/sl";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import useJwtDecode from "../../hooks/jwtDecode";
import axios from "axios";
import { GoTrash } from "react-icons/go";
import $ from "jquery";
import { useState } from "react";
import COMMON from "../../utils/Common";
import Modal from "../Modal/Modal";
const PrivateMessage = ({ message, userHub }) => {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
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
  /* update message */
  const updateMessage = () => {
    axios
      .put(
        `${COMMON.API_BASE_URL}PrivateMessages/UpdatePrivateMessage`,
        {
          privateMessageId: messageId,
          content: editValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub.invoke(
          "UpdatePrivateMessage",
          response.data,
          message.userId,
          message.receiver
        );
        handleCancel();
        $(`.optionsBtn${message.messageId}`).hide();
      });
  };
  /* delete attachment */
  const deleteAttachment = (attachmentId) => {
    axios
      .delete(
        `${COMMON.API_BASE_URL}PrivateMessages/DeletePrivateMessageImage/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub.invoke(
          "DeletePrivateMessageAttachment",
          response.data,
          message.userId,
          message.receiver
        );
        handleCancel();
      });
  };
  /* delete message*/
  const deleteMessage = (messageId) => {
    axios
      .delete(
        `${COMMON.API_BASE_URL}PrivateMessages/DeletePrivateMessage/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub.invoke(
          "DeletePrivateMessage",
          response.data,
          message.userId,
          message.receiver
        );
        handleCancel();
      });
  };
  return (
    <div
      className="messageItem"
      style={{ textAlign: "left" }}
      onMouseEnter={() => {
        $(`.msgOptionsBtnWrapper${message.messageId}`).show();
      }}
      onMouseLeave={() => {
        $(`.msgOptionsBtnWrapper${message.messageId}`).hide();
      }}
    >
      <div className="dFlex">
        <img
          src={message.avatar}
          alt="Sender"
          className="messageSenderImage"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            marginRight: "10px",
          }}
        />
        <h3 style={{ marginTop: 0 }}>
          {message.userName} <small>{message.dateCreated}</small>
        </h3>
        <p className="dNone">{message.messageId}</p>
        {user.username === message.userName && (
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
              {user.username === message.userName && (
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
            {message.content}
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
                          {attachment.displayName}
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
                  {user.username === message.userName ? (
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
                  ) : (
                    null
                  )}
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
};
export default PrivateMessage;
