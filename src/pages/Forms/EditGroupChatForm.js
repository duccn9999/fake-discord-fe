import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { MdOutlineDelete } from "react-icons/md";
import axios from "axios";
import { useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import useJwtDecode from "../../hooks/jwtDecode";
import { SlOptions } from "react-icons/sl";
export function EditGroupChatForm({
  isEditGroupChatFormOpen,
  handleToggleBigForms,
  groupChat,
}) {
  const [toggle, setToggle] = useState(1);
  const [currentGroupChat, setCurrentGroupChat] = useState(groupChat);
  const [coverImage, setCoverImage] = useState(groupChat.coverImage);
  const [name, setName] = useState(groupChat.name);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const updateToggle = (value) => {
    setToggle(value);
  };
  const updatedGroupChat = {
    groupChatId: groupChat.groupChatId,
    name: !name ? groupChat.name : name,
    coverImage: !coverImage ? groupChat.coverImage : coverImage,
    userCreated: user.userId,
  };
  // update group chat
  const updateGroupChat = (e) => {
    e.preventDefault();
    axios
      .put(`${COMMON.API_BASE_URL}GroupChats/Update`, updatedGroupChat, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Update success", {
          position: "top-right",
          autoClose: 5000,
        });
        setCurrentGroupChat(response.data);
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  // delete group chat
  const deleteGroupChat = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}GroupChats/Delete/${id}`, {
        headers: {
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
  return (
    <div style={{ height: "100vh" }} className="bgBlack4 textFaded">
      <div className="dGrid" style={{ gridTemplateColumns: "20% 70% 10%" }}>
        <div className="tabs">
          <div>
            <ul style={{ listStyleType: "none", textAlign: "left" }}>
              <li>
                <h4>{currentGroupChat.name} group chat's profile</h4>
              </li>
              <li>
                <button
                  className="btn bgBlack3 w100 textFaded"
                  onClick={() => updateToggle(1)}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  className="btn bgBlack3 w100 textFaded"
                  onClick={() => updateToggle(2)}
                >
                  Roles
                </button>
              </li>
              <li>
                <button
                  className="btn bgBlack3 w100 textFaded"
                  onClick={() => updateToggle(3)}
                >
                  Invites
                </button>
              </li>
              <li>
                <button
                  className="btn bgBlack3 w100 textFaded dFlex alignCenter justifyCenter"
                  onClick={() => deleteGroupChat(currentGroupChat.groupChatId)}
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
            groupChat={groupChat}
            toggle={toggle}
            updateGroupChat={updateGroupChat}
            coverImage={coverImage}
            name={name}
            setCoverImage={setCoverImage}
            setName={setName}
          />
          <Roles
            groupChat={groupChat}
            toggle={toggle}
            user={user}
            token={token}
          />
        </div>
        <div>
          <button
            onClick={() => handleToggleBigForms(1)}
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
  toggle,
  groupChat,
  updateGroupChat,
  coverImage,
  setCoverImage,
  name,
  setName,
}) {
  useEffect(() => {
    setCoverImage(groupChat.coverImage);
    setName(groupChat.name);
  }, [groupChat]);

  const previewImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`${toggle === 1 ? "dBlock" : "dNone"}`}>
      <h4>Overview</h4>
      <form
        style={{ width: "400px", margin: "auto" }}
        onSubmit={updateGroupChat}
      >
        <div className="dFlex">
          <div
            className="inputGroup"
            style={{ width: "100px", height: "100px" }}
          >
            <label htmlFor="imagePreview">Image</label>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              className="hidden"
              onChange={previewImage}
            />
            <img
              alt="img"
              src={coverImage}
              style={{ width: "100%", borderRadius: "50%" }}
              id="imagePreview"
              onClick={() => document.getElementById("imageInput").click()}
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="name">Group chat name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="btn bgDanger textFaded">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
function Roles({ toggle, groupChat, user, token }) {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRoles(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, []);
  return (
    <div className={`${toggle === 2 ? "dBlock" : "dNone"}`}>
      <h4>Roles</h4>
      <p>Use roles to group your group chat and assign permissions.</p>
      {/* roles search */}
      <div>
        <form style={{ width: "500px" }}>
          <div className="formGroup dFlex">
            <input id="keyword" />
            <button className="bgPrimary textFaded btn">Search</button>
            <button className="bgSuccess textFaded btn">
              <a href="#">Create Roles</a>
            </button>
          </div>
        </form>
      </div>
      {/* role list */}
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Members</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={index}>
              <td>{role.roleName}</td>
              <td>{role.color}</td>
              <td>
                <button>
                  <SlOptions />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default EditGroupChatForm;
