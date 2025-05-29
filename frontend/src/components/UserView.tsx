import { useState, useEffect } from "react";

function UserView() {
  const [username, setUsername] = useState("juan123");
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Fetch user data for "juan123"
    fetch(`/users/${username}`)
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
        setNewUsername(data.username);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, [username]);

  const handleUpdate = () => {
    // Update username and password
    fetch(`/users/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername, password }),
    })
      .then((response) => {
        if (response.ok) {
          alert("User updated successfully");
          setUsername(newUsername); // Update the username in the state
        } else {
          response.json().then((data) => alert(data.error || "Update failed"));
        }
      })
      .catch((error) => console.error("Error updating user data:", error));
  };

  return (
    <div>
      <h1>User View</h1>
      {userData ? (
        <div>
          <p>Current Username: {userData.username}</p>
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
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default UserView;