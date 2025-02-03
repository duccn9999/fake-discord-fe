import { useSelector } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";

export function Message({ message }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  return (
    <div className="message">
      <div
        className={`dFlex alignCenter  ${
          message.username === user.username
            ? "justifyFlexEnd"
            : "justifyFlexStart"
        }`}
      >
        <h3 style={{ marginTop: 0 }}>{message.username}</h3>
        <img
          className="avatarCircle"
          style={{ "--avatar-size": "40px" }}
          src={message.avatar}
          alt="avt"
        />
      </div>
      <p
        style={{
          textAlign: message.username === user.username ? "end" : "start",
        }}
      >
        {message.content}
      </p>
    </div>
  );
}

export default Message;
