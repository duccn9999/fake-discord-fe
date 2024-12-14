import homeStyles from "./Home.module.css";
import { FiAlignJustify } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
function Home({ session }) {
  if (!session) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div className="gridContainer">
        <div className={"bgHardBlack"}>
          <div>
            <FiAlignJustify />
          </div>
          <div className="chatList">
            <div className={`${homeStyles.chatComponent}`}>
              <div className={`${homeStyles.avatar} dInlineBlock`}>
                <img src="https://dummyimage.com/40/c9ed85/fff&text=chat" />
              </div>
              <div className="dInlineBlock">
                <div className="chatName">
                  <strong>name</strong>
                </div>
                <div className={homeStyles.chatContent}>
                  <p>chat context</p>
                </div>
              </div>
            </div>
            <div className={`${homeStyles.chatComponent}`}>
              <div className={`${homeStyles.avatar} dInlineBlock`}>
                <img src="https://dummyimage.com/40/c9ed85/fff&text=chat" />
              </div>
              <div className={`${homeStyles.metaData} dInlineBlock`}>
                <div className="chatName">
                  <strong>name</strong>
                </div>
                <div className={homeStyles.chatContent}>
                  <p>chat context</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"bgSoftBlack"}></div>
      </div>
    </>
  );
}

export default Home;
