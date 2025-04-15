import React, { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import $ from "jquery";
import axios from "axios";
import { useEffect } from "react";
const PrivateChat = ({ friend, userHub }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [inputMessages, setInputMessages] = useState([]);
  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input }]);
      setInput("");
    }
  };
  // removeImage function to remove an image from the previewImages array
  const removeImage = (index) => {
    setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };
  if (!friend) {
    return;
  }
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
        className="msgContainer textFaded dFlex"
        style={{
          padding: "0 1rem 0 1rem",
          overflowY: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column", // Change to normal column direction
        }}
      >
        {/* LoaderRef at the top */}
        <div style={{ flexGrow: 1 }}></div>
      </div>
      <div className="posSticky" style={{ bottom: 0 }}>
        <div
          className="previewImages bgFaded"
          style={{
            padding: "1rem",
            display: previewImages.length > 0 ? "flex" : "none",
          }}
        >
          {/* make the images at the left by default, it currently center */}
          {previewImages.map((image, index) => (
            <div
              key={index}
              style={{ display: "inline-block", position: "relative" }}
            >
              <img
                src={image}
                alt={`Preview ${index}`}
                style={{ width: "77px", height: "77px", margin: "0 5px" }}
              />
              <button
                onClick={() => removeImage(index)}
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
          <form
            className="dFlex"
            // onSubmit={updateBtnClicked ? updateMessage : sendMessage}
          >
            <div className="w100 dFlex alignCenter">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <div
                  className="imgUploadBtn"
                  onClick={() => $("#fileInput").click()}
                >
                  <CiImageOn color="white" />
                </div>
              </div>
              <input
                type="text"
                className="dBlock"
                // onChange={(e) => setMessage(e.target.value)}
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

export default PrivateChat;
