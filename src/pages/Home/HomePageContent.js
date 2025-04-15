import { useSelector, useDispatch } from "react-redux";
import useJwtDecode from "../../hooks/jwtDecode";
import FriendList from "./FriendList";
import PrivateChat from "./PrivateChat";
import { useState } from "react";
export function HomePageContent({ userHub }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const dispatch = useDispatch();
  const [selectedFriend, setSelectedFriend] = useState(null);
  return (
    <>
      <div className="dFlex" style={{ height: "100vh" }}>
        <FriendList userHub={userHub} setSelectedFriend={setSelectedFriend} selectedFriend={selectedFriend} />
        <div style={{ width: "80%", height: "100%" }}>
          <PrivateChat friend={selectedFriend} userHub={userHub} />
        </div>
      </div>
    </>
  );
}

export default HomePageContent;
