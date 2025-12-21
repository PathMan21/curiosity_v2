import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import interestsValues from "../Assets/interests.json";


function CompleteInscription() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [SelectedInterests, SetSelectedInterests] = useState([]);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams, setToken]);

  function handleInterests(value) {
    console.log("Selected Interests " + SelectedInterests);
    SetSelectedInterests((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const activeToken = searchParams.get("token") || token;
    
    if (!activeToken) {
      setError("Vous devez être authentifié pour continuer");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      let interests = SelectedInterests;
      const response = await fetch("http://localhost:3000/api/auth/complete-inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ username, password, interests}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour du profil");
      }

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Heureux de vous connaitre !</h1>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit} className="pure-form pure-form-aligned">
        <fieldset>
          <div className="pure-control-group">
            <label htmlFor="aligned-name">Username</label>
            <input
              id="aligned-name"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="pure-control-group">

            {interestsValues.interestsSchema.map((value, index) => {
            const valueCleaned = value.split("_").join(" ");
            return (
            <li><label htmlFor="aligned-name" key={index}> {valueCleaned} 
            <input type="checkbox" 
            checked={SelectedInterests.includes(value)}
            onChange={() => handleInterests(value)}
            value={value}/>
            </label></li>
            )})}

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
              {loading ? "Mise à jour..." : "Compléter l'inscription"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default CompleteInscription;
