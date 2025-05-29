import { useState, useEffect } from "react";

function UserView({ user, setLoggedUser }) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setNewUsername(user.username);
  }, [user.username]);

  const handleUpdate = () => {
    fetch(`/users/${user.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername, password }),
    })
      .then((response) => {
        if (response.ok) {
          fetch(`/users/${newUsername}`)
            .then((res) => res.json())
            .then((userData) => setLoggedUser(userData));
          alert("User updated successfully");
        } else {
          response.json().then((data) => alert(data.error || "Update failed"));
        }
      })
      .catch((error) => console.error("Error updating user data:", error));
  };

  return (
    <div>
      <h1>User View</h1>
      <div>
        <p>Current Username: {user.username}</p>
        <label>
          New Username:
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button onClick={handleUpdate}>Update</button>
      </div>
    </div>
  );
}

export default UserView;