import { BiErrorAlt } from "react-icons/bi";
export default function MessageSectionNotFound() {
  return (
    <div
      style={{ width: "100%", height: "100%"}}
      className="bgBlack1 textFaded posRelative"
    >
      <div className="posAbsolute" style={{top: "30%", left: "15%"}}>
        <BiErrorAlt style={{width: "70px", height: "70px"}}/>
        <h1>No text channels</h1>
        <p>
          You find yourself in a strange place. You don't have access to asy
          text channels or there are none in this server
        </p>
      </div>
    </div>
  );
}
