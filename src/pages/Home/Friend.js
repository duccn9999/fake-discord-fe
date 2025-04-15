import React from "react";
import { useSelector } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import { FaUserFriends } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";

export function Friend({ friend, setSelectedFriend, selectedFriend }) {
  return (
    <div
      className="friendContainer dFlex alignCenter"
      style={{
        height: "36px",
        padding: "10px",
        borderBottom: "1px solid #ccc",
      }}
      onClick={() => {
        if(selectedFriend && selectedFriend.id === friend.id) {
          setSelectedFriend(null);
        }
        else {
          setSelectedFriend(friend);
        }
      }}
    >
      <img
        src={friend.avatar}
        alt="img"
        style={{ width: "40px", borderRadius: "50%", marginRight: "5px" }}
      />
      {friend.userName}
    </div>
  );
}

export default Friend;
