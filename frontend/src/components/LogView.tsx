import { useState } from "react";

function LoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log(data); 
        if (response.ok) {
          setMessage(`Login successful. Welcome, ${data.username}!`);
        } else {
          setMessage(data.error || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setMessage("Network error");
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleLogin}>Log In</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginView;
