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
    <div className="fantasy-container">
      <style>{`
        .fantasy-container {
          font-family: 'Segoe UI', sans-serif;
          max-width: 400px;
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

        p {
          text-align: center;
          margin-top: 1rem;
        }

        .secondary-button {
          background: transparent;
          border: 1px solid #0a3d62;
          color: #0a3d62;
          padding: 0.5rem 1rem;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .secondary-button:hover {
          background: #dff9fb;
        }
      `}</style>

      <h1>{isRegisterMode ? "Registro" : "Inicio de sesión"}</h1>

      <label>
        {isRegisterMode ? "Nuevo usuario:" : "Usuario:"}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>

      <label>
        {isRegisterMode ? "Nueva contraseña:" : "Contraseña:"}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button onClick={handleAction}>
        {isRegisterMode ? "Registrarse" : "Iniciar sesión"}
      </button>

      {message && <p>{message}</p>}

      {isRegisterMode ? (
        <>
          <p>¿Ya tienes cuenta?</p>
          <button className="secondary-button" onClick={() => setIsRegisterMode(false)}>Iniciar sesión</button>
        </>
      ) : (
        <>
          <p>¿No tienes cuenta?</p>
          <button className="secondary-button" onClick={() => setIsRegisterMode(true)}>Registrarse</button>
        </>
      )}
    </div>
  );
}

export default LoginView;
