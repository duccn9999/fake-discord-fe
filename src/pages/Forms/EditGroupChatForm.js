import { useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { MdOutlineDelete } from "react-icons/md";
import axios from "axios";
import { useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import useJwtDecode from "../../hooks/jwtDecode";
import { SlOptions } from "react-icons/sl";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";
import $ from "jquery";
import Modal from "../Modal/Modal";
export function EditGroupChatForm({
  isEditGroupChatFormOpen,
  handleToggleBigForms,
  groupChat,
}) {
  const [toggle, setToggle] = useState(1);
  const [currentGroupChat, setCurrentGroupChat] = useState(groupChat);
  const [coverImage, setCoverImage] = useState(groupChat.coverImage);
  const [name, setName] = useState(groupChat.name);
  const [editRoleOptionToggle, setEditRoleOptionToggle] = useState(false);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [showModal, setShowModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const updateToggle = (value) => {
    setToggle(value);
  };
  const confirmDelete = (deleteFunc) => {
    setDeleteAction(() => deleteFunc); // Store the function to call
    setShowModal(true);
  };
  const handleDelete = () => {
    if (deleteAction) {
      deleteAction(); // Execute the stored function
    }
    setShowModal(false);
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
    <>
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
                    onClick={() => {
                      updateToggle(2);
                      setEditRoleOptionToggle(false);
                    }}
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
                    onClick={() => {
                      confirmDelete(() =>
                        deleteGroupChat(currentGroupChat.groupChatId)
                      );
                    }}
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
              editRoleOptionToggle={editRoleOptionToggle}
              setEditRoleOptionToggle={setEditRoleOptionToggle}
              updateToggle={updateToggle}
            />
            <Invite
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
      <Modal
        message="Are you sure you want to delete this group chat?"
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </>
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
              className="dNone"
              onChange={previewImage}
            />
            <img
              alt="img"
              src={coverImage}
              style={{ width: "100%", borderRadius: "50%" }}
              id="imagePreview"
              onClick={() => $("#imageInput").click()}
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
function Roles({
  toggle,
  groupChat,
  user,
  token,
  editRoleOptionToggle,
  setEditRoleOptionToggle,
  updateToggle,
}) {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  const confirmDelete = (deleteFunc) => {
    setDeleteAction(() => deleteFunc); // Store the function to call
    setShowModal(true);
  };
  const handleDelete = () => {
    if (deleteAction) {
      deleteAction(); // Execute the stored function
    }
    setShowModal(false);
  };
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
  }, [token]);

  const getRole = (id) => {
    axios
      .get(`${COMMON.API_BASE_URL}Roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRole(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  };
  const deleteRole = (id) => {
    axios
      .delete(`${COMMON.API_BASE_URL}Roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        toast.success("Delete success", {
          position: "top-right",
          autoClose: 5000,
        });
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  return (
    <div className={`${toggle === 2 ? "dBlock" : "dNone"}`}>
      <div className={`${editRoleOptionToggle === false ? "dBlock" : "dNone"}`}>
        <h4>Roles</h4>
        <p>Use roles to group your group chat and assign permissions.</p>
        {/* roles search */}
        <div className="dFlex">
          <form style={{ width: "500px" }}>
            <div className="formGroup dFlex">
              <input
                id="keyword"
                placeholder="Enter keyword to searching for roles"
              />
            </div>
          </form>
          <button
            className="bgSuccess textFaded btn"
            onClick={() => {
              setRole(null);
              setEditRoleOptionToggle(true);
            }}
          >
            Create Roles
          </button>
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
            {roles
              .filter((role) => role.roleId !== 1 && role.roleId !== 2) // Exclude roleId 1 and 2
              .map((role, index) => (
                <tr key={index}>
                  <td>{role.roleName}</td>
                  <td>{role.color}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ padding: 5 }}
                      onClick={() => {
                        $(`.optionsBtn${role.roleId}`).toggle();
                      }}
                    >
                      <SlOptions />
                    </button>
                    <div
                      className={`optionsBtn${role.roleId} posAbsolute`}
                      style={{ display: "none", zIndex: 1 }}
                    >
                      <button
                        className="btn bgPrimary textFaded dBlock"
                        style={{ padding: 5 }}
                        onClick={() => {
                          setEditRoleOptionToggle(true);
                          getRole(role.roleId);
                        }}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className="btn bgDanger textFaded"
                        style={{ padding: 5 }}
                        onClick={() =>
                          confirmDelete(() => deleteRole(role.roleId))
                        }
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className={`${editRoleOptionToggle === true ? "dBlock" : "dNone"}`}>
        <h4>Edit roles</h4>
        <div className="dGrid" style={{ gridTemplateColumns: "20% 80%" }}>
          <div id="left">
            <h4
              style={{ cursor: "pointer" }}
              className="dFlex alignCenter justifyFlexStart"
              onClick={() => {
                updateToggle(2);
                setEditRoleOptionToggle(false);
              }}
            >
              <FaArrowLeft />
              Back
            </h4>
          </div>
          <div id="right">
            <h4>{role ? "Edit role" : "Create role"}</h4>
            <RoleTabs role={role} />
          </div>
        </div>
      </div>
      <Modal
        message="Are you sure you want to delete this role?"
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
// role tabs
function RoleTabs({ role }) {
  const [toggleRoleTabs, setToggleRoleTabs] = useState(1);

  const renderContent = () => {
    switch (toggleRoleTabs) {
      case 1:
        return <Display role={role} />;
      case 2:
        return <Permissions role={role} />;
      case 3:
        return <ManageMembers />;
      default:
        return null;
    }
  };

  return (
    <div id="roleTabs">
      <div id="roleTabsOption" className="dFlex">
        <button className="btn" onClick={() => setToggleRoleTabs(1)}>
          Display
        </button>
        {role && (
          <>
            <button className="btn" onClick={() => setToggleRoleTabs(2)}>
              Permissions
            </button>
            <button className="btn" onClick={() => setToggleRoleTabs(3)}>
              Manage members
            </button>
          </>
        )}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}

function Display({ role }) {
  const [roleName, setRoleName] = useState("");
  const [color, setColor] = useState("#000000");
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  // Update form inputs when role changes
  useEffect(() => {
    if (role) {
      setRoleName(role.roleName || "");
      setColor(role.color || "#000000");
      $("#roleName").val(role.roleName);
      $("#roleColor").val(role.color);
    }
  }, [role]);
  // Create roles
  const createRole = (e) => {
    e.preventDefault();
    const newRole = {
      roleName: roleName,
      color: color,
      userCreated: user.userId,
    };
    axios
      .post(`${COMMON.API_BASE_URL}Roles`, newRole, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      })
      .then(() => {
        toast.success("Role created success", {
          position: "top-right",
          autoClose: 5000,
        });
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  // update roles
  const updateRole = (e) => {
    e.preventDefault();
    const updatedRole = {
      roleId: role.roleId,
      roleName: roleName,
      color: color,
      userModified: user.userId,
    };
    axios
      .put(`${COMMON.API_BASE_URL}Roles`, updatedRole, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      })
      .then(() => {
        toast.success("Role updated success", {
          position: "top-right",
          autoClose: 5000,
        });
      })
      .catch((err) => {
        toast.error(err, {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };
  return (
    <>
      <form onSubmit={role ? updateRole : createRole}>
        <div className="inputGroup" style={{ textAlign: "left" }}>
          <label htmlFor="roleName">Role Name</label>
          <input
            type="text"
            id="roleName"
            style={{ width: "30%" }}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div className="inputGroup" style={{ textAlign: "left" }}>
          <label htmlFor="roleColor">Role Color</label>
          <input
            type="color"
            id="roleColor"
            style={{
              height: "40px",
              width: "10%",
              padding: "0",
              borderRadius: 0,
            }}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div className="inputGroup" style={{ textAlign: "left" }}>
          <button className="btn bgSuccess textFaded">Submit</button>
        </div>
      </form>
    </>
  );
}

function Permissions({ role }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permission, setPermission] = useState(null);
  // assign role
  const assignRolePermission = (permission) => {
    const rolePermissionModel = {
      roleId: role.roleId,
      permissionId: permission.permissionId,
    };
    axios
      .post(`${COMMON.API_BASE_URL}RolePermissions`, rolePermissionModel, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.status);
      })
      .catch((err) => {
        Error(err);
      });
  };
  // get permissions
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}Permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPermissions(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, [token]);
  // get role permissions
  useEffect(() => {
    axios
      .get(`${COMMON.API_BASE_URL}RolePermissions/${role.roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRolePermissions(response.data);
      })
      .catch((err) => {
        Error(err);
      });
  }, [token, role]);

  const togglePermission = (permission) => {
    setRolePermissions((prev) => {
      const exists = prev.some(
        (x) => x.permissionId === permission.permissionId
      );

      if (exists) {
        return prev.filter((x) => x.permissionId !== permission.permissionId);
      } else {
        return [...prev, permission]; // Add the permission
      }
    });
  };
  return (
    <div style={{ textAlign: "left", overflowY: "scroll", height: "80vh" }}>
      <h1>Permissions</h1>
      {permissions.map((permission, index) => (
        <div key={index}>
          <div className="dFlex alignCenter justifySpaceBetween">
            <h3>{permission.name}</h3>
            <div>
              <button
                className={`btn ${
                  rolePermissions.some(
                    (x) => x.permissionId === permission.permissionId
                  )
                    ? "bgSuccess"
                    : "bgDanger"
                }`}
                onClick={() => {
                  togglePermission(permission);
                  setPermission(permission);
                  assignRolePermission(permission);
                }}
              >
                {rolePermissions.some(
                  (x) => x.permissionId === permission.permissionId
                )
                  ? "V"
                  : "X"}
              </button>
            </div>
          </div>
          <p>{permission.description}</p>
        </div>
      ))}
    </div>
  );
}

function ManageMembers() {
  return <h1>Manage Members</h1>;
}
function Invite({ groupChat, toggle, user, token }) {
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}GroupChats/GetInviteCode/${groupChat.groupChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setInviteCode(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [groupChat.groupChatId, token]);

  useEffect(() => {
    if (inviteCode) {
      setInviteLink(`${COMMON.CLIENT_BASE_URL}invite/${inviteCode}`);
    }
  }, [inviteCode]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink).then(
      () => alert("Invite link copied to clipboard!"),
      (err) => console.error("Failed to copy:", err)
    );
  };
  return (
    <div className={`${toggle === 3 ? "dBlock" : "dNone"}`}>
      <h4>Invite</h4>
      <div className="dFlex justifyCenter">
        <div className="bgBlack2" style={{ padding: "5px" }}>
          {inviteCode || "Loading..."}
        </div>
        <button onClick={copyInviteLink} disabled={!inviteLink} className="btn">
          Copy
        </button>
      </div>
    </div>
  );
}
export default EditGroupChatForm;
