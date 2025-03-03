import { SlOptions } from "react-icons/sl";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import axios from "axios";
import $ from "jquery";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
export function Message({ message, handleUpdateMessage, channelHub }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  //Delete message
  const deleteMessage = async () => {
    const response = await axios
      .delete(
        `${COMMON.API_BASE_URL}Messages/DeleteMessage/${message.messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
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
  return (
    <div
      className="message"
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
        {user.username === message.username && (
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
              style={{ display: "none", zIndex: 1 }}
            >
              <button
                className="btn bgPrimary textFaded dBlock"
                style={{ padding: 5 }}
                onClick={() => {
                  handleUpdateMessage(message.messageId, message.content);
                }}
              >
                <FaRegEdit />
              </button>
              <button
                className="btn bgDanger textFaded"
                style={{ padding: 5 }}
                onClick={deleteMessage}
              >
                <MdDeleteOutline />
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <p
          style={{
            textAlign: "start",
          }}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default Message;
