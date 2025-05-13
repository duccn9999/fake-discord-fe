import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import axios from "axios";
import { useEffect, useState } from "react";
import COMMON from "../../utils/Common";
import {
  GET_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
} from "../../reducers/notificationsReducer";
import { FaUserFriends } from "react-icons/fa";
import $ from "jquery";
import Friend from "./Friend";
export function FriendList({ userHub, setSelectedFriend, selectedFriend }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [receiver, setReceiver] = useState("");
  const notifications = useSelector((state) => state.notifications.value);
  const [friends, setFriends] = useState([]);
  const sendFriendRequest = async (e) => {
    e.preventDefault();
    const friendRequestModel = {
      userId1: user.userId,
      receiver: receiver,
    };
    await axios
      .post(
        `${COMMON.API_BASE_URL}UserFriends/SendFriendRequest`,
        friendRequestModel,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub
          .invoke("SendFriendRequest", response.data)
          .catch((error) =>
            console.error("Error invoking SendFriendRequest:", error)
          );
      });
    setReceiver("");
  };
  // Update notification status
  const markNotificationAsRead = async (notification) => {
    await axios
      .put(
        `${COMMON.API_BASE_URL}Notifications/MarkNotificationAsRead/${notification.notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(UPDATE_NOTIFICATION(response.data));
        $(`.notificationItem${notification.notificationId}`).addClass(
          "disabled"
        );
      })
      .catch((error) => {
        console.error("Error updating notification:", error);
      });
  };
  // response in friend request
  const acceptFriendRequestResponse = async (notification) => {
    await axios
      .put(
        `${COMMON.API_BASE_URL}Notifications/AcceptFriendRequestResponse`,
        {
          notificationId: notification.notificationId,
          isRead: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(UPDATE_NOTIFICATION(response.data));
      })
      .catch((error) => {
        console.error("Error updating notification:", error);
      });
  };
  // Accept friend request
  const acceptFriendRequest = async (notification) => {
    await axios
      .put(
        `${COMMON.API_BASE_URL}UserFriends/AcceptFriendRequest`,
        {
          userId1: user.userId,
          userId2: notification.userId1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub
          .invoke("AcceptFriendRequest", response.data)
          .catch((error) =>
            console.error("Error invoking AcceptFriendRequest:", error)
          );
      });
    await acceptFriendRequestResponse(notification);
  };
  // Cancel friend request
  const cancelFriendRequest = async (notification) => {
    await axios
      .delete(
        `${COMMON.API_BASE_URL}UserFriends/CancelFriendRequest/${user.userId}/${notification.userId1}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        userHub
          .invoke("CancelFriendRequest", response.data)
          .catch((error) =>
            console.error("Error invoking CancelFriendRequest:", error)
          );
      });
  };
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      await axios
        .get(
          `${COMMON.API_BASE_URL}Notifications/GetNotifications/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          dispatch(GET_NOTIFICATIONS(response.data));
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });
    };
    fetchNotifications();
  }, [user.userId, token, dispatch]);
  // Fetch friend list
  useEffect(() => {
    const fetchFriends = async () => {
      await axios
        .get(
          `${COMMON.API_BASE_URL}UserFriends/GetFriendsByUser/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setFriends(response.data);
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
        });
    };
    fetchFriends();
  }, [user.userId, token]);
  return (
    <div
      className="friendList bgBlack3 textFaded"
      style={{ width: "20%", minWidth: "150px", height: "100%" }}
    >
      <div className="tabs">
        <div>
          <div
            className="tab alignCenter justifyCenter notificationsTab"
            style={{
              position: "relative",
              width: "fit-content", // This makes the div only as wide as its content
              display: "inline-flex", // Ensures proper alignment
              padding: "0 10px 0 10px",
            }}
            onClick={() => {
              $("#notificationList").toggle();
            }}
          >
            <FaUserFriends />
            {notifications.filter(
              (notification) => notification.isRead === false
            ).length > 0 && (
              <span className="notificationDot">
                {
                  notifications.filter(
                    (notification) => notification.isRead === false
                  ).length
                }
              </span>
            )}
          </div>
          <div
            id="notificationList"
            className="bgFaded textInverse dNone"
            style={{ position: "absolute", width: "40.5vh", zIndex: 100 }}
          >
            {notifications.map((notification, index) => {
              return (
                <div
                  key={index}
                  className={`notificationItem notificationItem${
                    notification.notificationId
                  } ${notification.isRead === true ? "disabled" : ""}`}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                  }}
                  onClick={() => {
                    if (notification.isRead === false) {
                      markNotificationAsRead(notification);
                    }
                  }}
                >
                  {notification.message}
                  {notification.isRead === false && notification.type && (
                    <div className="dFlex justifySpaceBetween promptBtns">
                      <button
                        className="btnSmall bgSuccess textFaded"
                        onClick={() => {
                          acceptFriendRequest(notification);
                        }}
                      >
                        Yes
                      </button>
                      <button
                        className="btnSmall bgDanger textFaded"
                        onClick={() => {
                          cancelFriendRequest(notification);
                        }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <h2 style={{ margin: "0" }}>Friends</h2>
      <div>
        <div>
          <form onSubmit={sendFriendRequest}>
            <div className="formGroup dFlex">
              <input
                type="text"
                placeholder="Enter username that you want to send friend request"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
              <button className="btn bgPrimary textFaded">Send</button>
            </div>
          </form>
        </div>
        <div className="friends">
          {friends.map((friend, index) => {
            return (
              <Friend
                key={index}
                friend={friend}
                setSelectedFriend={setSelectedFriend}
                selectedFriend={selectedFriend}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FriendList;
