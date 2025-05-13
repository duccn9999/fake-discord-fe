import FriendList from "./FriendList";
import PrivateMessageContainer from "./PrivateMessageContainer";
import { useState } from "react";
export function HomePageContent({ userHub }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  return (
    <>
      <div className="dFlex" style={{ height: "100vh" }}>
        <FriendList
          userHub={userHub}
          setSelectedFriend={setSelectedFriend}
          selectedFriend={selectedFriend}
        />
        {selectedFriend ? (
          <div style={{ width: "80%", height: "100%" }}>
            <PrivateMessageContainer
              friend={selectedFriend}
              userHub={userHub}
            />
          </div>
        ) : (
          null
        )}
      </div>
    </>
  );
}

export default HomePageContent;
