import Styles from "./Home.module.css";
export function Channel({ channel, setChannelClick, setChannel }) {
  return (
    <div>
      <button
        className={`bgBlack4 textFaded ${Styles.channel}`}
        onClick={() => {
          setChannelClick(true);
          setChannel(channel);
        }}
      >
        {channel.channelName}
      </button>
    </div>
  );
}
