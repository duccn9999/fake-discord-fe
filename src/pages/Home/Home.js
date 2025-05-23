import Styles from "./Home.module.css";
import { FaPlus } from "react-icons/fa";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import $ from "jquery";
import COMMON from "../../utils/Common";
import { Channel } from "./Channel";
import { MessagesContainer } from "./MessagesContainer";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoIosOptions } from "react-icons/io";
import useJwtDecode from "../../hooks/jwtDecode";
import { useDispatch, useSelector } from "react-redux";
import { GET_CHANNELS } from "../../reducers/channelsReducer";
import { toast } from "react-toastify";
import { clear } from "../../reducers/tokenReducer";
import EditChannelForm from "../Forms/EditChannelForm";
import { MdExpandMore } from "react-icons/md";
import EditGroupChatForm from "../Forms/EditGroupChatForm";
import { IoHomeSharp } from "react-icons/io5";
import { HomePageContent } from "./HomePageContent";
import { useAddLastSeenMessage } from "../../hooks/addLastSeenMessage";
import UserHubProvider, { UserHubContext } from "../../Contexts/userHubContext";
import GroupChatHubProvider, {
  GroupChatHubContext,
} from "../../Contexts/groupChatHubContext";
import ChannelHubProvider, {
  ChannelHubContext,
} from "../../Contexts/channelHubContext";
import GroupChatIdProvider, {
  GroupChatIdContext,
} from "../../Contexts/groupChatIdContext";
import { useFetchRolesByGroupChat } from "../../hooks/fetchRolesByGroupChat";
import  useFetchUsersInGroupChat from "../../hooks/fetchUsersInGroupChat";
import useRolePermissionsOfUserInGroupChat from "../../hooks/rolePermissionsOfUserInGroupChat";
import { GET_PERMISSIONS } from "../../reducers/permissionsReducer";
import { ProfileSettingForm } from "../Forms/ProfileSettingForm";
function GroupChat({ groupChat, handleGroupChatClick, groupChatTracking }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const groupChatHub = useContext(GroupChatHubContext);
  const permissions = useRolePermissionsOfUserInGroupChat(
    groupChat.groupChatId
  );

  useEffect(() => {
    if (permissions) {
      dispatch(GET_PERMISSIONS(permissions));
    }
  }, [permissions, dispatch]);

  return (
    <div
      className={`${Styles.groupChat}`}
      onClick={() => {
        handleGroupChatClick(groupChat.groupChatId);
        groupChatTracking(groupChat);
        groupChatHub
          .invoke("OnEnterGroupChat", user.username, groupChat)
          .catch((err) => console.error("SignalR Error:", err));
      }}
      data-name={`${groupChat.name}`}
    >
      <div className={`${Styles.avatar} dInlineBlock`}>
        <img src={groupChat.coverImage} alt={`img-${groupChat.groupChatId}`} />
      </div>
    </div>
  );
}
function CreateGroupChatForm({ handleToggleSmallForms }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const token = useSelector((state) => state.token.value);
  let user = useJwtDecode(token);

  // Handle preview image
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl); // Set the preview image
    return () => URL.revokeObjectURL(file);
  }, [file]);
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFile(file); // Set the file for upload
      };
    }
  };
  const createGroupChat = async (e) => {
    e.preventDefault();
    try {
      // After the image is uploaded, proceed with creating the group chat
      const GroupChat = new FormData();
      GroupChat.append("coverImage", file); // Append the file to the FormData object
      GroupChat.append("name", groupChatName); // Append the group chat name
      GroupChat.append("userCreated", user.userId); // Append the user ID
      await axios
        .post(`${COMMON.API_BASE_URL}GroupChats/Create`, GroupChat)
        .then(() => {
          window.location.reload();
        });
      handleToggleSmallForms(1);
    } catch (error) {
      console.error("Error uploading image:", error);
      $(".error").html(`Error uploading image: ${error.message}`);
    }
  };
  return (
    <>
      <div
        className="overlay"
        onClick={() => {
          handleToggleSmallForms(1);
          setPreview(null);
          setFile(null);
          setGroupChatName(null);
        }}
      >
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
              <button type="submit" className="btnSmall bgDanger">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
function GroupChatsContainer({ handleGroupChatClick }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [groupChats, setGroupChats] = useState([]);
  const groupChatHub = useContext(GroupChatHubContext);
  const [currentGroupChat, setCurrentGroupChat] = useState(null);
  const [previousGroupChat, setPreviousGroupChat] = useState(null);
  // Handle display joined groupChat
  const fetchGroupChats = async (userId) => {
    await axios
      .get(`${COMMON.API_BASE_URL}GroupChats/GetJoinedGroupChats/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correctly set Authorization header
        },
      })
      .then((response) => {
        setGroupChats(response.data);
      })
      .catch(() => {
        dispatch(clear(token));
      });
  };
  useEffect(() => {
    fetchGroupChats(user.userId);
  }, [user.userId]);
  // track current groupChat that user enters
  const groupChatTracking = (value) => {
    setCurrentGroupChat(value);
    if (
      currentGroupChat &&
      value.groupChatId !== currentGroupChat.groupChatId
    ) {
      setPreviousGroupChat(currentGroupChat);
    }
  };
  // disconnect from groupChat
  // tracking the last seen message
  const addLastSeenMessage = useAddLastSeenMessage();
  useEffect(() => {
    if (previousGroupChat) {
      groupChatHub
        .invoke("OnLeaveGroupChat", user.username, previousGroupChat)
        .then((message) => {
          addLastSeenMessage(message);
        })
        .catch((err) => console.error("SignalR Error:", err));
    }
  }, [previousGroupChat, user.username, groupChatHub, addLastSeenMessage]);
  if (!groupChats.length) {
    return;
  }
  return (
    <div className="groupChatsContainer" id="groupChatsContainer">
      {groupChats.map((groupChat) => (
        <GroupChat
          key={groupChat.groupChatId}
          groupChat={groupChat}
          handleGroupChatClick={handleGroupChatClick}
          groupChatTracking={groupChatTracking}
        />
      ))}
    </div>
  );
}

function GroupChatContent({
  isGroupChatClicked,
  isChannelClicked,
  isHomeBtnClicked,
  handleToggleSmallForms,
  setChannelClick,
  handleToggleBigForms,
  channel,
  setChannel,
  groupChat,
  setGroupChat,
}) {
  const [isChannelExist, setChannelExist] = useState(true);
  const [previousChannel, setPreviousChannel] = useState(null);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const channelHub = useContext(ChannelHubContext);
  const groupChatId = useContext(GroupChatIdContext).groupChatId;
  useEffect(() => {
    const fetchGroupChat = async () => {
      if (isGroupChatClicked && groupChatId) {
        try {
          console.log(`Fetching group chat with ID: ${groupChatId}`);
          const response = await axios.get(
            `${COMMON.API_BASE_URL}GroupChats/GetGroupChatById/${groupChatId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200) {
            setGroupChat(response.data);
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error fetching group chat:", error.message);
          toast.error("Failed to enter group chat: " + error.message, {
            position: "top-right",
            autoClose: 3000,
          });
          dispatch(clear(token));
        }
      } else {
        setGroupChat(null);
      }
    };
    fetchGroupChat();
  }, [groupChatId, isGroupChatClicked]);
  const channelTracker = (value) => {
    if (channel && channel?.channelId !== value.channelId) {
      setPreviousChannel(channel);
    }
    if (!channel || channel.channelId !== value.channelId) {
      setChannel(value);
    }
  };
  // disconnect from channel
  const addLastSeenMessage = useAddLastSeenMessage();
  useEffect(() => {
    if (previousChannel) {
      channelHub
        .invoke("OnLeave", user.username, previousChannel)
        .then((message) => {
          addLastSeenMessage(message);
        })
        .catch((err) => console.error("SignalR Error:", err));
    }
  }, [previousChannel, user.username, channelHub, addLastSeenMessage]);
  if (!groupChatId) {
    return;
  }
  if (isHomeBtnClicked) {
    return;
  }
  return (
    <div className="dFlex">
      <div
        className="header bgBlack3 posRelative"
        style={{
          overflowY: "auto",
          width: "15%",
          minWidth: "150px",
          height: "100vh",
        }}
      >
        <div className="posSticky" style={{ top: 0, left: 0, right: 0 }}>
          <button
            className="btnSmall w100 bgBlack2 dFlex alignCenter"
            onClick={() => {
              $("#EditGroupChatBtnSmall").toggle();
            }}
          >
            <h3 className={`textFaded ${Styles.groupChatTitle}`}>
              {groupChat ? groupChat.name : "loading..."}
            </h3>
            <MdExpandMore className="textFaded" />
          </button>
          <div
            className="dNone posAbsolute w100"
            id="EditGroupChatBtnSmall"
            style={{ zIndex: 1 }}
          >
            <button
              className="w100 btnSmall textFaded dFlex alignCenter justifySpaceAround"
              style={{ backgroundColor: "black" }}
              onClick={() => {
                handleToggleBigForms(3);
              }}
            >
              <span>Edit group chat profile</span>
              <FaCog style={{ width: "20px" }} />
            </button>
          </div>
        </div>
        <button
          className="bgBlack3 textFaded borderNone w100"
          onClick={() => handleToggleSmallForms(3)}
        >
          Add Channels <FaPlus style={{ width: "10px", height: "10px" }} />
        </button>
        <ChannelsContainer
          groupChatId={groupChatId}
          setChannelExist={setChannelExist}
          setChannelClick={setChannelClick}
          channelTracker={channelTracker}
          handleToggleBigForms={handleToggleBigForms}
          setChannel={setChannel}
        />
      </div>
      {isChannelClicked ? (
        <MessagesContainer channel={channel} groupChatId={groupChatId} />
      ) : null}
    </div>
  );
}
function ChannelsContainer({
  setChannelExist,
  setChannelClick,
  channelTracker,
  handleToggleBigForms,
  setChannel,
}) {
  const channels = useSelector((state) => state.channels.value);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const groupChatId = useContext(GroupChatIdContext).groupChatId;
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Channels/GetChannelsByGroupChatId/${groupChatId}/${user.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data;
        if (!data || data.length === 0) {
          setChannelExist(false);
        } else {
          setChannelExist(true);
        }
        dispatch(GET_CHANNELS(data));
      })
      .catch((error) => {
        console.error(error.response?.data || error.message);
      });
  }, [groupChatId]);
  if (!channels || channels.length === 0) {
    return null;
  }
  return (
    <div id="channelsContainer">
      {channels.map((channel, index) => (
        <Channel
          key={index}
          channel={channel}
          setChannelClick={setChannelClick}
          channelTracker={channelTracker}
          handleToggleBigForms={handleToggleBigForms}
          setChannel={setChannel}
        />
      ))}
    </div>
  );
}
function CreateChannelForm({ handleToggleSmallForms, token }) {
  const [channelName, setChannelName] = useState(null);
  const dispatch = useDispatch();
  const [isPrivate, setIsPrivate] = useState(false);
  const channelNameRef = useRef(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const groupChatHub = useContext(GroupChatHubContext);
  const groupChatId = useContext(GroupChatIdContext).groupChatId;
  const handleCheckboxChange = (e) => {
    setIsPrivate(e.target.checked); // `checked` gives true/false
  };
  const handleNextButtonClick = (e) => {
    if (!channelNameRef.current.value.trim()) {
      e.stopPropagation();
    }
  };
  const handleRolesCheckbox = (roleId) => {
    setSelectedRoles(
      (prevSelectedRoles) =>
        prevSelectedRoles.includes(roleId)
          ? prevSelectedRoles.filter((id) => id !== roleId) // Remove if unchecked
          : [...prevSelectedRoles, roleId] // Add if checked
    );
  };
  const handleUsersCheckbox = (userId) => {
    setSelectedUsers(
      (prevSelectedUsers) =>
        prevSelectedUsers.includes(userId)
          ? prevSelectedUsers.filter((id) => id !== userId) // Remove if unchecked
          : [...prevSelectedUsers, userId] // Add if checked
    );
  };
  // handle create private channels
  const handlePrivateChannelForm = () => {
    if (isPrivate) {
      $("#createChannelForm").removeClass("dBlock").addClass("dNone"); // Hide public form
      $("#createPrivateChannelForm").removeClass("dNone").addClass("dBlock"); // Show private form
    } else {
      $("#createChannelForm").removeClass("dNone").addClass("dBlock"); // Show public form
      $("#createPrivateChannelForm").addClass("dNone").removeClass("dBlock"); // Hide private form
    }
  };
  // handle when user clicks the back button
  const handleBackButtonClick = () => {
    setIsPrivate(false);
    setChannelName("");
    channelNameRef.current.value = "";
    $("#createChannelForm").removeClass("dNone").addClass("dBlock"); // Show public form
    $("#createPrivateChannelForm").addClass("dNone").removeClass("dBlock"); // Hide private form
  };
  let user = useJwtDecode(token);
  const createChannel = async (e) => {
    e.preventDefault();
    const model = {
      groupChatId: groupChatId,
      channelName: channelName,
      userCreated: user.userId,
    };
    const response = await axios.post(
      `${COMMON.API_BASE_URL}Channels/CreateChannel`,
      model, // Axios automatically stringifies JSON
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      handleToggleSmallForms(1);
      groupChatHub.invoke("CreateChannel", response.data);
    }
    if (response.status === 401) {
      toast.error("Failed create channel: " + response.data, {
        position: "top-right",
        autoClose: 3000,
      });
      dispatch(clear(token));
    }
  };
  // get roles from group chat
  const { rolesByGroupChat, fetchRolesByGroupChat } =
    useFetchRolesByGroupChat();
  // get members from group chat
  const { usersInGroupChat, fetchUsersInGroupChat } =
    useFetchUsersInGroupChat();

  // create private channel
  const createPrivateChannel = async (e) => {
    e.preventDefault();
    const model = {
      groupChatId: groupChatId,
      channelName: channelName,
      userCreated: user.userId,
      roles: selectedRoles,
      users: selectedUsers.includes(user.userId)
        ? selectedUsers
        : [...selectedUsers, user.userId],
    };
    const response = await axios.post(
      `${COMMON.API_BASE_URL}Channels/CreatePrivateChannel`,
      model, // Axios automatically stringifies JSON
      {
        headers: {
          "Content-Type": "application/json", // Correct header for JSON
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      handleToggleSmallForms(1);
      setIsPrivate(false);
      setChannelName("");
      channelNameRef.current.value = "";
      setSelectedRoles([]);
      setSelectedUsers([]);
      groupChatHub.invoke("CreateChannel", response.data);
    }
    if (response.status === 401) {
      handleToggleSmallForms(1);
      setIsPrivate(false);
      setChannelName("");
      channelNameRef.current.value = "";
      setSelectedRoles([]);
      setSelectedUsers([]);
      toast.error("Failed create channel: " + response.data, {
        position: "top-right",
        autoClose: 3000,
      });
      dispatch(clear(token));
    }
  };
  return (
    <>
      <div
        className="overlay dFlex alignCenter justifyCenter"
        onClick={() => {
          handleToggleSmallForms(1);
          setIsPrivate(false);
          setChannelName("");
          channelNameRef.current.value = "";
          setSelectedRoles([]);
          setSelectedUsers([]);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ padding: "3rem", borderRadius: "10%" }}
          className="bgFaded"
        >
          <div id="createChannelForm" className="dBlock">
            {/* public channel form */}
            <form onSubmit={createChannel}>
              <h2>Create Channel</h2>
              <p className="error textDanger"></p>
              <div className="inputGroup">
                <label htmlFor="channelName">Channel Name</label>
                <input
                  type="text"
                  id="channelName"
                  ref={channelNameRef}
                  placeholder="Enter channel name"
                  onChange={(e) => setChannelName(e.target.value)}
                />
              </div>
              <div className="inputGroup dFlex alignCenter">
                <input
                  style={{ width: "1rem" }}
                  type="checkbox"
                  id="isPrivate"
                  value="true"
                  checked={isPrivate}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isPrivate">Private channel</label>
              </div>
              {!isPrivate && (
                <div className="inputGroup">
                  <button type="submit" className="btn bgDanger">
                    Submit
                  </button>
                </div>
              )}
            </form>
            {isPrivate && (
              <div>
                <button
                  disabled={$("#channelName").val()?.trim() === ""}
                  className="btn bgSuccess"
                  onClick={() => {
                    handleNextButtonClick();
                    handlePrivateChannelForm();
                    fetchUsersInGroupChat(groupChatId);
                    fetchRolesByGroupChat(groupChatId);
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div id="createPrivateChannelForm" className="dNone">
            <form onSubmit={createPrivateChannel}>
              <h2>Add members or roles</h2>
              <div className="inputGroup dFlex alignCenter">
                <input
                  type="text"
                  placeholder="Enter member's name or role's name"
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label>
                  <strong>Roles</strong>
                </label>
                {rolesByGroupChat.map((role, index) => (
                  <div
                    key={index}
                    className="dFlex alignCenter justifySpaceBetween"
                  >
                    <p style={{ color: role.color, fontWeight: "bold" }}>
                      {role.roleName}
                    </p>
                    <div>
                      <input
                        type="checkbox"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: "#5cb85c",
                        }}
                        checked={selectedRoles.includes(role.roleId)}
                        onChange={() => handleRolesCheckbox(role.roleId)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="inputGroup">
                <label>Members</label>
                {usersInGroupChat.map((user, index) => (
                  <div
                    key={index}
                    className="dFlex alignCenter justifySpaceBetween"
                  >
                    <p style={{ fontWeight: "bold" }}>{user.userName}</p>
                    <div>
                      <input
                        type="checkbox"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: "#5cb85c",
                        }}
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => handleUsersCheckbox(user.userId)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="inputGroup dFlex alignCenter justifySpaceBetween">
                <button
                  type="button"
                  className="btn bgSecondary textFaded"
                  onClick={handleBackButtonClick}
                >
                  Back
                </button>
                <button type="submit" className="btn bgSuccess textFaded">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Home() {
  const [isGroupChatClicked, setGroupChatClick] = useState(false);
  const [isChannelClicked, setChannelClick] = useState(false);
  const [isHomeBtnClicked, setHomeBtnClick] = useState(false);

  const [channel, setChannel] = useState(null);
  const [groupChat, setGroupChat] = useState(null);

  const [toggleBigForms, setToggleBigForms] = useState(1);
  const [toggleSmallForms, setToggleSmallForms] = useState(1);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const userHub = useContext(UserHubContext);
  const setGroupChatId = useContext(GroupChatIdContext).setGroupChatId;

  const handleGroupChatClick = (groupChatId) => {
    setGroupChatClick(true);
    setChannelClick(false);
    setGroupChatId(groupChatId);
    setHomeBtnClick(false);
  };

  const handleToggleBigForms = (value) => {
    setToggleBigForms(value);
  };
  const handleToggleSmallForms = (value) => {
    setToggleSmallForms(value);
  };

  // Track if user leave the page or not
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      if (userHub) {
        userHub.invoke("OnDisconnected", user.username).catch((err) => {
          console.error("SignalR Error:", err);
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userHub, user?.username]);
  // Redirect if token is cleared or expired
  if (!token) {
    return <Navigate to={"/"} />;
  }
  let content;
  switch (toggleBigForms) {
    case 1:
      content = (
        <UserHubProvider>
          <GroupChatHubProvider>
            <ChannelHubProvider>
              {toggleSmallForms === 1 && (
                <div className="dFlex" style={{ height: "100vh" }}>
                  <div
                    className={"bgBlack1 leftSided dFlex alignCenter"}
                    style={{
                      overflowY: "auto",
                      minWidth: "70px",
                      flexDirection: "column",
                      height: "100vh",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <button
                        className="btn bgBlack3 textFaded"
                        onClick={() => {
                          setHomeBtnClick(true);
                          setGroupChatClick(false);
                        }}
                      >
                        <IoHomeSharp />
                      </button>
                    </div>
                    <GroupChatsContainer
                      handleGroupChatClick={handleGroupChatClick}
                    />
                    <button
                      className="btnSmall btnSmallRounded bgSuccess"
                      onClick={() => handleToggleSmallForms(2)}
                    >
                      <FaPlus />
                    </button>
                    <div style={{ marginTop: "auto" }}>
                      <div
                        id="optBtnSmalls"
                        className="posAbsolute"
                        style={{
                          display: "none",
                          bottom: "39.5px",
                          width: "68px",
                        }}
                      >
                        <button
                          className="dBlock btnSmall bgInverse textFaded w100"
                          onClick={() => {
                            dispatch(clear(token));
                          }}
                        >
                          <span className="dFlex alignCenter justifyEvenly">
                            Log out <RiLogoutBoxRLine />
                          </span>
                        </button>
                        <button
                          className="dBlock btnSmall bgSecondary textInverse w100"
                          onClick={() => handleToggleBigForms(4)}
                        >
                          <span className="dFlex alignCenter justifyEvenly">
                            Profile Setting <FaCog />
                          </span>
                        </button>
                      </div>
                      <div>
                        <button
                          className="btnSmall bgFaded textInverse w100"
                          onClick={() => {
                            $("#optBtnSmalls").toggle();
                          }}
                        >
                          <span className="dFlex alignCenter justifyEvenly">
                            <img
                              alt="img"
                              src={user.avatar}
                              className="avatarCircle"
                              style={{ "--avatar-size": "25px" }}
                            />
                            <IoIosOptions />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    className={"bgBlack2 rightSided"}
                    style={{ overflowY: "overlay" }}
                  >
                    {/* chat content here */}
                    {isGroupChatClicked ? (
                      <GroupChatContent
                        isGroupChatClicked={isGroupChatClicked}
                        isHomeBtnClicked={isHomeBtnClicked}
                        isChannelClicked={isChannelClicked}
                        handleToggleSmallForms={handleToggleSmallForms}
                        setGroupChatClick={setGroupChatClick}
                        setChannelClick={setChannelClick}
                        handleToggleBigForms={handleToggleBigForms}
                        channel={channel}
                        setChannel={setChannel}
                        groupChat={groupChat}
                        setGroupChat={setGroupChat}
                      />
                    ) : (
                      <HomePageContent />
                    )}
                  </div>
                </div>
              )}
              {toggleSmallForms === 2 && (
                <CreateGroupChatForm
                  handleToggleSmallForms={handleToggleSmallForms}
                />
              )}
              {toggleSmallForms === 3 && (
                <CreateChannelForm
                  handleToggleSmallForms={handleToggleSmallForms}
                  token={token}
                />
              )}
            </ChannelHubProvider>
          </GroupChatHubProvider>
        </UserHubProvider>
      );
      break;
    case 2:
      content = (
        <EditChannelForm
          handleToggleBigForms={handleToggleBigForms}
          channel={channel}
        />
      );
      break;
    case 3:
      content = (
        <EditGroupChatForm
          handleToggleBigForms={handleToggleBigForms}
          groupChat={groupChat}
        />
      );
      break;
    case 4:
      content = <ProfileSettingForm handleToggleBigForms={handleToggleBigForms} />;
      break;
    default:
      content = null;
  }
  return content;
}
export default Home;
