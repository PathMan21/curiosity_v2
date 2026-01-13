import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import interestsValues from "../../Assets/interests.json";


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
        body: JSON.stringify({ username, password, interests }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour du profil");
      }

      const data = await response.json();
      if (data.token) {
        console.log(data);
        setToken(data.token);
      }

      navigate('/Home');

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="text-center mb-4">Heureux de vous connaitre !</h1>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="aligned-name" className="form-label">Username</label>
                  <input
                    id="aligned-name"
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label d-block mb-2">Vos intérêts</label>
                  <div className="row">
                    {interestsValues.interestsSchema.map((value, index) => {
                      const valueCleaned = value.split("_").join(" ");
                      return (
                        <div key={index} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input 
                              type="checkbox" 
                              className="form-check-input"
                              id={`interest-${index}`}
                              checked={SelectedInterests.includes(value)}
                              onChange={() => handleInterests(value)}
                              value={value}
                            />
                            <label className="form-check-label" htmlFor={`interest-${index}`}>
                              {valueCleaned}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="aligned-password" className="form-label">Password</label>
                  <input
                    id="aligned-password"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Mise à jour..." : "Compléter l'inscription"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteInscription;
