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
    <div className="user-view-container">
      <style>{`
        .user-view-container {
          font-family: 'Segoe UI', sans-serif;
          max-width: 500px;
          margin: 2rem auto;
          padding: 2rem;
          border-radius: 10px;
          background: #f5f6fa;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          color: #1e1e2f;
        }

        h1 {
          text-align: center;
          color: #0a3d62;
          margin-bottom: 1.5rem;
        }

        p {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          color: #2f3640;
        }

        label {
          display: block;
          margin-bottom: 1rem;
          color: #2f3640;
          font-weight: bold;
        }

        input {
          display: block;
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.3rem;
          border-radius: 6px;
          border: 1px solid #dcdde1;
          font-size: 1rem;
        }

        button {
          background: #0a3d62;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          margin-top: 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          width: 100%;
        }

        button:hover {
          background: #1b9cfc;
        }
      `}</style>

      <h1>Mi perfil</h1>

      <p>Usuario actual: <strong>{user.username}</strong></p>

      <label>
        Nuevo nombre de usuario:
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
      </label>

      <label>
        Nueva contraseña:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button onClick={handleUpdate}>Actualizar datos</button>
    </div>
  );
}

export default UserView;