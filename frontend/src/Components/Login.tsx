import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Connectez vous</h1>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form className="pure-form pure-form-aligned" onSubmit={handleSubmit}>
        <fieldset>
          <div className="pure-control-group">
            <label htmlFor="aligned-email">Email Address</label>
            <input
              id="aligned-email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="pure-control-group">
            <label htmlFor="aligned-password">Password</label>
            <input
              id="aligned-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="pure-controls">
            <button 
              type="submit" 
              className="pure-button pure-button-primary"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default Login;

