import { useState } from "react";

function CompleteInscription({ token }: { token?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("http://localhost:3000/complete-inscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      credentials: "include", 
      body: JSON.stringify({ username, password }),
    });
    
    // redirection après inscription complétée
    window.location.href = "/";
  };

  return (
      <div>
        <h1>Heureux de vous connaitre !</h1>;
      <form  onSubmit={handleSubmit} className="pure-form pure-form-aligned">
       <fieldset>
        <div className="pure-control-group">
            <label htmlFor="aligned-name">Username</label>
            <input id="aligned-name" type="text" placeholder="Username" />
            <span className="pure-form-message-inline">This is a required field.</span>
        </div>
        <div className="pure-control-group">
            <label htmlFor="aligned-password">Password</label>
            <input id="aligned-password" type="password" placeholder="Password" />
        </div>
        <div className="pure-control-group">
            <label htmlFor="aligned-email">Email Address</label>
            <input id="aligned-email" type="email" placeholder="Email Address" />
        </div>
        <div className="pure-controls">
            <label htmlFor="aligned-cb" className="pure-checkbox">
                <input id="aligned-cb" type="checkbox" /> I&#x27;ve read the terms and conditions
            </label>
            <button type="submit" className="pure-button pure-button-primary">Submit</button>
        </div>
    </fieldset>
    </form>
    </div>
  );
}


export default CompleteInscription;