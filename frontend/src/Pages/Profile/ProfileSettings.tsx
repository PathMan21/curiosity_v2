import FooterSite from "../../Components/FooterSite";
import NavbarSite from "../../Components/NavbarSite";
import { useAuth } from "../../Context/AuthContext";
import interestsValues from "../../Assets/interests.json";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../Services/apiClient";

function ProfileSettings() {

  function handleInterests(value) {
    SetSelectedInterests((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  }

  const { user, updateProfile, fetchUserProfile } = useAuth();

  // Parser les intérêts s'ils sont en JSON
  const parseInterests = (interests: string | undefined): string[] => {
    if (!interests) return [];
    try {
      return typeof interests === 'string' ? JSON.parse(interests) : interests;
    } catch {
      return [];
    }
  };

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [interests, SetSelectedInterests] = useState(parseInterests(user?.interests));
  const [picture, setPicture] = useState(user?.picture || null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mettre à jour les champs si le user change
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      SetSelectedInterests(parseInterests(user.interests));
      setPicture(user.picture || null);
    }
  }, [user]);

  const handlesubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setError("");
    setSuccess("");
    
    let btn = document.querySelector('button[type="submit"]');
    if (btn) btn.innerHTML = "Chargement ...";
    
    try {
      const response = await fetchWithAuth(
        "/users/updated-profile",
        {
          method: "POST",
          body: JSON.stringify({ username, email, interests, picture }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      
      const data = await response.json();
      console.log("Réponse mise à jour:", data);
      
      if (data.status === "Success") {
        // Mettre à jour les tokens dans le contexte
        updateProfile(data.accessToken, data.refreshToken);
        // Récupérer le profil à jour
        await fetchUserProfile();
        setSuccess("Profil mis à jour avec succès!");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      if (btn) btn.innerHTML = "Valider les modifications";
    }
  }

  if (!user) {
    return (
      <>
        <NavbarSite />
        <div className="bg-light min-vh-100 py-5">
          <div className="container mt-4">
            <div className="row">
              <div className="col-md-8 mx-auto">
                <div className="card shadow">
                  <div className="card-body">
                    <p>Chargement du profil...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterSite />
      </>
    );
  }

  return (
    <>
      <NavbarSite></NavbarSite>
      <div className="bg-light min-vh-100 py-5">
        <form onSubmit={handlesubmit}>
          <div className="container mt-4">
            <div className="row">
              <div className="col-md-8 mx-auto">
                <div className="card shadow">
                  <div className="card-body">
                    <h3 className="card-title mb-4">Paramètres de profil</h3>
                    
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError("")}></button>
                      </div>
                    )}
                    
                    {success && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                      </div>
                    )}
                    
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                          Username
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="username"
                          placeholder={user.username}
                          onChange={(e) => setUsername(e.target.value)}
                          value={username}
                        />
                      </div>
                      <div className="mb-3">
                        <h6 className="form-label">Intérêts</h6>
                    {interestsValues.interestsSchema.map((value, index) => {
                      const valueCleaned = value.split("_").join(" ");
                      return (
                        <div key={index} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input 
                              type="checkbox" 
                              className="form-check-input"
                              id={`interest-${index}`}
                              checked={interests.includes(value)}
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
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder={user.email}
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100">
                        Valider les modifications
                      </button>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <FooterSite></FooterSite>
    </>
  );
}

export default ProfileSettings;
