export function MessageContainer({ groupChat, channel }) {
  return (
    <>
      <h1 className="textFaded">
        Welcome to {channel.channelName}
      </h1>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%" }}>
        <form className="dFlex">
          <input type="text" className="dBlock" />
          <button>Submit</button>
        </form>
      </div>
    </>
  );
}
