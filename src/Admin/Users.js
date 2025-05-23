import React, { useState } from "react";

// Sample data (replace with your actual data source)
const initialUsers = [
  {
    UserId: 1,
    UserName: "john_doe",
    Password: "password123",
    Avatar: "https://i.pravatar.cc/40?img=1",
    Email: "john@example.com",
    DateCreated: "2024-06-01T10:00:00",
  },
  {
    UserId: 2,
    UserName: "jane_smith",
    Password: "securepass",
    Avatar: "https://i.pravatar.cc/40?img=2",
    Email: "jane@example.com",
    DateCreated: "2024-06-02T11:30:00",
  },
  // Add more users as needed
];

export function Users() {
    const [search, setSearch] = useState("");
    const [users] = useState([
        {
            UserId: 1,
            Username: "john_doe",
            Avatar: "https://i.pravatar.cc/40?img=1",
            Email: "john@example.com",
            IsActive: true,
            DateCreated: "2024-06-01T10:00:00",
        },
        {
            UserId: 2,
            Username: "jane_smith",
            Avatar: "https://i.pravatar.cc/40?img=2",
            Email: "jane@example.com",
            IsActive: false,
            DateCreated: "2024-06-02T11:30:00",
        },
        // Add more users as needed
    ]);

    const handleView = (user) => {
        alert(`Viewing user: ${user.Username}`);
    };

    const handleBlock = (user) => {
        alert(`Blocking user: ${user.Username}`);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.Username.toLowerCase().includes(search.toLowerCase()) ||
            user.Email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <h2>Users List</h2>
            <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 16, padding: 8, width: 300 }}
            />
            <table
                border="1"
                cellPadding="8"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
            >
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Avatar</th>
                        <th>Email</th>
                        <th>IsActive</th>
                        <th>DateCreated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user, index) => (
                        <tr key={index}>
                            <td>{user.Username}</td>
                            <td>
                                {user.Avatar ? (
                                    <img
                                        src={user.Avatar}
                                        alt="avatar"
                                        width={40}
                                        height={40}
                                        style={{ borderRadius: "50%" }}
                                    />
                                ) : (
                                    "N/A"
                                )}
                            </td>
                            <td>{user.Email}</td>
                            <td>{user.IsActive ? "Yes" : "No"}</td>
                            <td>{new Date(user.DateCreated).toLocaleString()}</td>
                            <td>
                                <button
                                    className="btn bgDanger textFaded"
                                    onClick={() => handleBlock(user)}
                                >
                                    Suspend
                                </button>
                                <button
                                    className="btn bgSuccess textFaded"
                                    onClick={() => handleBlock(user)}
                                >
                                    Reset user password
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
