import { useState } from "react";


const handleOAuthRegister = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/google/url", {
      method: 'GET',
    });

    const data = await response.json();

    console.log("data " + JSON.stringify(data.url));
    
    window.location.href = data.url;
    
  } catch (err) {
    console.error('Erreur:', err);
  }
};



function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState("");

  const handleForm = async (e: React.FormEvent) => {
    console.log(username);
    console.log(password);

    e.preventDefault();
    const response = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, interests }),
    });
    const data = await response.json();
    console.log(data);
  };


  return (
    <div>
      <h1>Inscrivez vous</h1>;
      <form className="pure-form pure-form-aligned" onSubmit={handleForm}>
        <fieldset>
          <div className="pure-control-group">
            <label htmlFor="aligned-name">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <span className="pure-form-message-inline">
              This is a required field.
            </span>
          </div>

          <div className="pure-control-group">
            <label htmlFor="aligned-password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pure-control-group">
            <label htmlFor="aligned-email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>


          <button type="submit">Submit</button>
        </fieldset>
      </form>{" "}
                <button
            className="pure-button pure-button-primary"
            onClick={handleOAuthRegister}
          >
            Google Auth
          </button>
    </div>
  );
}

export default Register;
