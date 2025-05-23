import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import $ from "jquery";
import { save } from "../../reducers/tokenReducer";
import COMMON from "../../utils/Common";
import useJwtDecode from "../../hooks/jwtDecode";
import { IoIosClose } from "react-icons/io";
import NotificationModal from "../Modal/NotificationModal";
import useFriendsByUser from "../../hooks/getFriendsByUser";
import useBlockedFriendsByUser from "../../hooks/getBlockedFriendsByUsers";
import {
  ADD_FRIEND,
  DELETE_FRIEND,
  GET_FRIENDS,
  UPDATE_FRIEND,
} from "../../reducers/friendsReducer";
import Modal from "../Modal/Modal";
import {
  DELETE_BLOCKED_FRIEND,
  GET_BLOCKED_FRIENDS,
} from "../../reducers/blockedFriendsReducer";
// ChangeUsername component
function ChangeUsername({ username, setUsername, onCancel }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);

  const changeUsername = () => {
    const model = {
      userId: user.userId,
      username: username ? username : user.username,
    };
    axios
      .put(`${COMMON.API_BASE_URL}Users/ChangeUsername`, model, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(save(response.data));
        toast.success("Username updated successfully.", {
          position: "top-right",
          autoClose: 3000,
        });
        onCancel();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update username.", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <>
      <input
        type="text"
        value={username !== null ? username : user.username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
      />
      <button className="btn bgPrimary textFaded" onClick={changeUsername}>
        Save
      </button>
      <button className="btn" onClick={onCancel}>
        Cancel
      </button>
    </>
  );
}

function ChangePassword({ onCancel }) {
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [error, setError] = useState("");
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const submitBtnRef = useRef(null);
  const dispatch = useDispatch();
  const changePassword = () => {
    axios
      .put(
        `${COMMON.API_BASE_URL}Users/ChangePassword`,
        {
          userId: user.userId,
          password: newPassword ? newPassword : user.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(save(response.data));
        toast.success("Password updated successfully.", {
          position: "top-right",
          autoClose: 3000,
        });
        onCancel();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update password.", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };
  useEffect(() => {
    if (newPassword && reNewPassword) {
      if (newPassword !== reNewPassword) {
        setError("Password is not the same");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  }, [newPassword, reNewPassword]);
  useEffect(() => {
    if (!newPassword || !reNewPassword || newPassword !== reNewPassword) {
      submitBtnRef.current.disabled = true;
      submitBtnRef.current.classList.remove("bgPrimary");
    } else {
      submitBtnRef.current.disabled = false;
      submitBtnRef.current.classList.add("bgPrimary");
    }
  }, [newPassword, reNewPassword]);
  return (
    <>
      <div className="inputGroup">
        <label>Current Password</label>
        <input type="password" value={user.password} readOnly />
      </div>
      <div className="inputGroup">
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="inputGroup">
        <label>Re-enter New Password</label>
        <input
          type="password"
          value={reNewPassword}
          onChange={(e) => setReNewPassword(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button
        className="btn bgPrimary textFaded"
        onClick={() => changePassword()}
        ref={submitBtnRef}
      >
        Save
      </button>
      <button className="btn" onClick={onCancel}>
        Cancel
      </button>
    </>
  );
}

// New ChangeEmail component
function ChangeEmail({ email, setEmail, onCancel }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [isVerified, setIsVerified] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const confirmNewEmail = (email) => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Users/ConfirmNewEmail/${user.userId}/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setIsVerified(response.data);
        setShowNotificationModal(false);
        setNotificationMessage("");
        setEmail(null);
        $(".emailInput").removeAttr("readOnly");
        $(".notificationP").text("Now enter your new email!!!");
      })
      .catch((err) => console.error(err));
  };

  const getToken = () => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Users/GetToken/${user.userId}/${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setNotificationMessage(response.data);
        setShowNotificationModal(true);
      });
  };

  const changeEmail = () => {
    const model = {
      userId: user.userId,
      email: email ? email : user.email,
    };
    axios
      .put(`${COMMON.API_BASE_URL}Users/ChangeEmail`, model, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(save(response.data));
        toast.success(
          "Update success. Please check your new email for a confirmation link.",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <p className="notificationP">
        <strong>
          Before your new email address is updated, we will send a confirmation
          email to verify your new address.
        </strong>
      </p>
      <input
        className="emailInput"
        type="email"
        value={email !== null ? email : user.email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
        readOnly
      />
      {!isVerified ? (
        <button
          className="btn bgSuccess textFaded"
          onClick={() => {
            getToken();
          }}
        >
          Verify
        </button>
      ) : (
        <button
          className="btn bgPrimary textFaded"
          onClick={() => changeEmail()}
        >
          Submit
        </button>
      )}
      <button className="btn" onClick={onCancel}>
        Cancel
      </button>
      {showNotificationModal ? (
        <NotificationModal
          show={showNotificationModal}
          message={notificationMessage}
          onClose={() => setShowNotificationModal(false)}
          onConfirm={(email) => confirmNewEmail(email)}
        />
      ) : null}
    </>
  );
}
// New EditAvatar component
function EditAvatar({ avatar, setAvatar, onCancel }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [preview, setPreview] = useState(avatar || user.avatar);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("avatar", file);

    axios
      .put(`${COMMON.API_BASE_URL}Users/ChangeAvatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        dispatch(save(response.data));
        setAvatar(response.data.avatar);
        toast.success("Avatar updated successfully.", {
          position: "top-right",
          autoClose: 3000,
        });
        onCancel();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update avatar.", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{ width: "100px", height: "100px", cursor: "pointer" }}
        onClick={handleImageClick}
      >
        <img
          src={preview}
          alt="avatar"
          className="w100"
          style={{ borderRadius: "50%" }}
        />
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="dBlock">
        <button className="btn bgPrimary textFaded" onClick={handleSave}>
          Save
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
function Overview() {
  const [editingField, setEditingField] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);

  return (
    <div>
      <h2 className="textFaded">Edit Profile</h2>
      <div className="inputGroup">
        <label>Avatar</label>
        {editingField === "avatar" ? (
          <EditAvatar
            avatar={avatar}
            setAvatar={setAvatar}
            onCancel={() => setEditingField(null)}
          />
        ) : (
          <div
            className="editableField"
            onClick={() => setEditingField("avatar")}
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            <img
              src={avatar !== null ? avatar : user.avatar}
              alt="avatar"
              className="w100"
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            />
          </div>
        )}
      </div>
      <div style={{ textAlign: "left" }}>
        <div className="inputGroup">
          <label>Username</label>
          {editingField === "username" ? (
            <ChangeUsername
              username={username}
              setUsername={setUsername}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div
              className="editableField"
              onClick={() => setEditingField("username")}
            >
              {username !== null ? username : user.username}
            </div>
          )}
        </div>
        <div className="inputGroup">
          <label>Email</label>
          {editingField === "email" ? (
            <ChangeEmail
              email={email}
              setEmail={setEmail}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div
              className="editableField"
              onClick={() => {
                setEditingField("email");
              }}
            >
              {email !== null ? email : user.email}
            </div>
          )}
        </div>
        <div className="inputGroup">
          <label>Password</label>
          {editingField === "password" ? (
            <ChangePassword
              password={password}
              setPassword={setPassword}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div
              className="editableField"
              onClick={() => setEditingField("password")}
            >
              ********
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Friends() {
  const [friendsTab, setFriendsTab] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  console.log("friends");
  const handleDelete = () => {
    if (deleteAction) {
      deleteAction(); // Execute the stored function
    }
    setShowModal(false);
  };

  const handleModalOpen = (value) => {
    setShowModal(value);
  };
  const handleModalMessage = (value) => {
    setModalMessage(value);
  };

  const confirmDelete = (deleteFunc) => {
    setDeleteAction(() => deleteFunc); // Store the function to call
    setShowModal(true);
  };
  return (
    <>
      <div>
        <h2>Friends</h2>
        <div
          style={{
            marginBottom: "1rem",
            borderBottom: "1px solid #444",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className={`tab ${
              friendsTab === 1 ? "active-tab bgPrimary textFaded" : ""
            }`}
            style={{
              padding: "10px 24px",
              cursor: "pointer",
              borderBottom: friendsTab === 1 ? "2px solid #007bff" : "none",
              fontWeight: friendsTab === 1 ? "bold" : "normal",
            }}
            onClick={() => setFriendsTab(1)}
          >
            Friends
          </div>
          <div
            className={`tab ${
              friendsTab === 2 ? "active-tab bgPrimary textFaded" : ""
            }`}
            style={{
              padding: "10px 24px",
              cursor: "pointer",
              borderBottom: friendsTab === 2 ? "2px solid #007bff" : "none",
              fontWeight: friendsTab === 2 ? "bold" : "normal",
            }}
            onClick={() => setFriendsTab(2)}
          >
            Blocked
          </div>
        </div>
        <input
          type="text"
          placeholder={
            friendsTab === 1 ? "Search friends..." : "Search blocked users..."
          }
          style={{ marginBottom: "1rem", width: "100%" }}
        />
        <table
          style={{ width: "100%", borderCollapse: "collapse" }}
          border="1"
          cellPadding="8"
          cellSpacing="0"
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #444", padding: "8px" }}>
                Avatar
              </th>
              <th style={{ borderBottom: "1px solid #444", padding: "8px" }}>
                UserName
              </th>
              <th style={{ borderBottom: "1px solid #444", padding: "8px" }}>
                {friendsTab === 1 ? "Request Date" : "Blocked Date"}
              </th>
              <th style={{ borderBottom: "1px solid #444", padding: "8px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {friendsTab === 1 ? (
              <FriendsTab
                handleDelete={handleDelete}
                handleModalOpen={handleModalOpen}
                handleModalMessage={handleModalMessage}
                confirmDelete={confirmDelete}
              />
            ) : (
              <BlockedTab
                handleDelete={handleDelete}
                handleModalOpen={handleModalOpen}
                handleModalMessage={handleModalMessage}
                confirmDelete={confirmDelete}
              />
            )}
          </tbody>
        </table>
      </div>
      {showModal ? (
        <Modal
          message={modalMessage}
          show={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

function FriendsTab(props) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const friends = useSelector((state) => state.friends.value);
  const { friendsData } = useFriendsByUser(user.userId);
  const dispatch = useDispatch();
  console.log("friends tab");
  const handleUnfriend = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}UserFriends/Unfriend/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(DELETE_FRIEND(response.data));
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleBlock = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}UserFriends/BlockUser/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(DELETE_FRIEND(response.data));
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    if (friendsData) {
      dispatch(GET_FRIENDS(friendsData));
    }
  }, [dispatch, friendsData]);

  // Render friends list
  if (!friends || friends.length === 0) {
    return (
      <tr>
        <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
          No friends found.
        </td>
      </tr>
    );
  }

  return (
    <>
      {friends.map((friend) => (
        <tr key={friend.id}>
          <td>
            <img
              src={friend.avatar}
              alt="avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          </td>
          <td>{friend.userName}</td>
          <td>
            {friend.requestDate
              ? new Date(friend.requestDate).toLocaleDateString()
              : ""}
          </td>
          <td>
            <button
              className="btn bgDanger textFaded"
              onClick={() => {
                props.handleModalMessage("Do you want to unfriend this user?");
                props.confirmDelete(() => {
                  handleUnfriend(friend.id);
                });
              }}
              style={{ marginRight: "8px" }}
            >
              Unfriend
            </button>
            <button
              className="btn bgWarning textFaded"
              onClick={() => {
                props.handleModalMessage("Do you want to block this user?");
                props.confirmDelete(() => {
                  handleBlock(friend.id);
                });
              }}
            >
              Block
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

function BlockedTab(props) {
  const token = useSelector((state) => state.token.value);
  const friends = useSelector((state) => state.blockedFriends.value);
  const dispatch = useDispatch();
  const user = useJwtDecode(token);
  const { blockedFriendsData } = useBlockedFriendsByUser(user.userId);
  console.log("block tab");
  const handleUnBlock = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}UserFriends/UnblockUser/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(DELETE_BLOCKED_FRIEND(response.data));
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    if (blockedFriendsData) {
      dispatch(GET_BLOCKED_FRIENDS(blockedFriendsData));
    }
  }, [dispatch, blockedFriendsData]);
  if (!friends || friends.length === 0) {
    return (
      <tr>
        <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
          No friends found.
        </td>
      </tr>
    );
  }
  return (
    <>
      {friends.map((friend) => (
        <tr key={friend.id}>
          <td>
            <img
              src={friend.avatar}
              alt="avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          </td>
          <td>{friend.userName}</td>
          <td>
            {friend.requestDate
              ? new Date(friend.requestDate).toLocaleDateString()
              : ""}
          </td>
          <td>
            <button
              className="btn bgSuccess textFaded"
              onClick={() => {
                props.handleModalMessage("Do you want to unblock this user?");
                props.confirmDelete(() => {
                  handleUnBlock(friend.id);
                });
              }}
              style={{ marginRight: "8px" }}
            >
              Unblock
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
export function ProfileSettingForm({ handleToggleBigForms }) {
  const [toggle, setToggle] = useState(1);
  console.log("profile setting form");
  return (
    <>
      <div style={{ height: "100vh" }} className="bgBlack4 textFaded">
        <div className="dFlex justifySpaceBetween" style={{ height: "100%" }}>
          <div className="tabs bgBlack3">
            <div id="userProfileOption">
              <div
                className={`bgBlack3 textFaded`}
                id="overviewBtn"
                onClick={() => setToggle(1)}
              >
                Overview
              </div>
              <div
                className={`bgBlack3 textFaded`}
                onClick={() => setToggle(2)}
              >
                Friends
              </div>
            </div>
          </div>
          <div>
            {toggle === 1 && <Overview />}
            {toggle === 2 && <Friends />}
          </div>
          <div>
            <button
              onClick={() => handleToggleBigForms(1)}
              style={{ float: "right" }}
              className="btn bgDanger textFaded"
            >
              <IoIosClose />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileSettingForm;
