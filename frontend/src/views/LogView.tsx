import { useState } from "react";

function LoginView({ setLoggedUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleAction = () => {
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    const endpoint = isRegisterMode ? "/register" : "/login";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          setMessage(
            isRegisterMode
              ? `Registration successful. Welcome, ${data.username}!`
              : `Login successful. Welcome, ${data.username}!`
          );
          fetch(`/users/${username}`)
            .then((res) => res.json())
            .then((userData) => setLoggedUser(userData));
        } else {
          setMessage(data.error || (isRegisterMode ? "Registration failed" : "Login failed"));
        }
      })
      .catch((error) => {
        setMessage("Network error");
      });
  };

  return (
    <div>
      <h1>{isRegisterMode ? "Register" : "Login"}</h1>
      <label>
        {isRegisterMode ? "New Username:" : "Username:"}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <br />
      <label>
        {isRegisterMode ? "New Password:" : "Password:"}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleAction}>
        {isRegisterMode ? "Register" : "Log In"}
      </button>
      {message && <p>{message}</p>}
      <br />
      {isRegisterMode ? (
        <>
          <p>¿Ya tienes cuenta?</p>
          <button onClick={() => setIsRegisterMode(false)}>Iniciar sesión</button>
        </>
      ) : (
        <>
          <p>¿No tienes cuenta?</p>
          <button onClick={() => setIsRegisterMode(true)}>Registrarte</button>
        </>
      )}
    </div>
  );
}

export default LoginView;
