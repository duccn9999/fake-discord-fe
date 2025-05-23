import { TbUsersGroup } from "react-icons/tb";
import { IoMdChatboxes } from "react-icons/io";
import { useState } from "react";
import Overview from "./Overview";
import Users from "./Users";
import GroupChat from "./GroupChats";
export function Dashboard(){
  const [tabsToggle, setTabsToggle] = useState(1);
  return (
    <div style={{ height: "100vh" }} className="bgBlack4 textFaded">
      <div className="dFlex justifySpaceBetween" style={{ height: "100%" }}>
        <div className="tabs bgBlack3">
          <div id="adminProfileOption">
            <div
              className={`bgBlack3 textFaded`}
              id="overviewBtn"
              onClick={() => setTabsToggle(1)}
              style={{ cursor: "pointer" }}
            >
              Overview
            </div>
            <div
              className={`bgBlack3 textFaded`}
              onClick={() => setTabsToggle(2)}
              style={{ cursor: "pointer" }}
            >
              Users
              <TbUsersGroup />
            </div>
            <div
              className={`bgBlack3 textFaded dFlex alignCenter justifyCenter${tabsToggle === 3 ? " active" : ""}`}
              onClick={() => setTabsToggle(3)}
              style={{ cursor: "pointer" }}
            >
              Group chats
              <IoMdChatboxes />
            </div>
          </div>
        </div>
        <div
          className="tabContent w100"
          style={{
            textAlign: "left",
            flexGrow: 1,
            padding: "0 2rem 0 2rem",
          }}
        >
          {tabsToggle === 1 && <Overview />}
          {tabsToggle === 2 && <Users />}
          {tabsToggle === 3 && <GroupChat />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
