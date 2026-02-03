import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import interestsValues from "../../Assets/interests.json";

function CompleteInscription() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, setToken, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams, setToken]);

  function handleInterests(value: string) {
    setSelectedInterests((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const activeToken = searchParams.get("token") || token || localStorage.getItem("authToken");
    console.log("complete-inscription: envoi avec token =", activeToken);

    if (!activeToken) {
      setError("Vous devez être authentifié pour continuer");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const interests = selectedInterests;
      const response = await fetch("http://localhost:3000/api/auth/complete-inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ interests }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || data?.status || "Erreur lors de la mise à jour du profil");
      }

      const data = await response.json().catch(() => ({}));
      if (data.accessToken && data.refreshToken) {
        setToken(data.accessToken, data.refreshToken);
        await fetchUserProfile();
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
                  <label className="form-label d-block mb-2">Vos intérêts</label>
                  <div className="row">
                    {interestsValues.interests.map((value, index) => {
                      const valueCleaned = value.id.split("_").join(" ");
                      return (
                        <div key={index} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`interest-${index}`}
                              checked={selectedInterests.includes(value.id)}
                              onChange={() => handleInterests(value.id)}
                              value={value.id}
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
