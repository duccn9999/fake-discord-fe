import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { MdOutlineDelete } from "react-icons/md";
import axios from "axios";
import { useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import useJwtDecode from "../../hooks/jwtDecode";
export function EditChannelForm({ isHomeDisplay, handleHomeDisplay, channel }) {
  const [toggle, setToggle] = useState(1);
  const [channelName, setChannelName] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(channel);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const updateToggle = (value) => {
    setToggle(value);
  };
  const updatedChannel = {
    ChannelId: channel.channelId,
    ChannelName: channelName ? channelName : channel.channelName,
    UserModified: user.id,
  };
  // update channel
  const updateChannel = (e) => {
    e.preventDefault();
    axios
      .put(`${COMMON.API_BASE_URL}Channels/UpdateChannel`, updatedChannel, {
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Update success", {
          position: "top-right",
          autoClose: 5000,
        });
        setCurrentChannel(response.data);
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  // delete channel
  const deleteChannel = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}Channels/DeleteChannel/${id}`, {
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        toast.success("Delete success", {
          position: "top-right",
          autoClose: 5000,
        });
        window.location.reload();
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  if (isHomeDisplay) return null;

  return (
    <div>
      <div className="dGrid" style={{ gridTemplateColumns: "20% 70% 10%" }}>
        <div className="tabs">
          <div>
            <ul style={{ listStyleType: "none", textAlign: "left" }}>
              <li>
                <h4>{currentChannel.channelName} Text channel</h4>
              </li>
              <li>
                <button className="btn w100" onClick={() => updateToggle(1)}>
                  Overview
                </button>
              </li>
              <li>
                <button className="btn w100" onClick={() => updateToggle(2)}>
                  Permissions
                </button>
              </li>
              <li>
                <button className="btn w100" onClick={() => updateToggle(3)}>
                  Invites
                </button>
              </li>
              <li>
                <button
                  className="btn w100 dFlex alignCenter justifyCenter"
                  onClick={() => deleteChannel(currentChannel.channelId)}
                >
                  Delete
                  <MdOutlineDelete />
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="tabContent">
          <Overview
            channel={currentChannel}
            toggle={toggle}
            setChannelName={setChannelName}
            channelName={channelName}
            updateChannel={updateChannel}
          />
          <Permissions channel={currentChannel} toggle={toggle} />
          <Invite channel={currentChannel} toggle={toggle} />
        </div>
        <div>
          <button
            onClick={() => handleHomeDisplay(true)}
            style={{ float: "right" }}
            className="btn bgDanger textFaded"
          >
            <IoIosClose />
          </button>
        </div>
      </div>
    </div>
  );
}
function Overview({
  channel,
  toggle,
  setChannelName,
  channelName,
  updateChannel,
}) {
  return (
    <div className={`${toggle === 1 ? "dBlock" : "dNone"}`}>
      <h4>Overview</h4>
      <div>
        <form
          style={{ width: "400px", margin: "auto" }}
          onSubmit={updateChannel}
        >
          <label htmlFor="name">Channel name</label>
          <input
            id="name"
            type="text"
            onChange={(e) => setChannelName(e.target.value)}
            value={!channelName ? channel.channelName : channelName}
          />
          <button className="btn bgDanger textFaded">Submit</button>
        </form>
      </div>
    </div>
  );
}
function Permissions({ channel, toggle }) {
  return (
    <div className={`${toggle === 2 ? "dBlock" : "dNone"}`}>
      <h4>Permissions</h4>
    </div>
  );
}
function Invite({ channel, toggle }) {
  return (
    <div className={`${toggle === 3 ? "dBlock" : "dNone"}`}>
      <h4>Invite</h4>
    </div>
  );
}
export default EditChannelForm;
