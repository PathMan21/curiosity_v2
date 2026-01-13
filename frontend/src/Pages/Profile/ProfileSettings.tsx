import FooterSite from "../../Components/FooterSite";
import NavbarSite from "../../Components/NavbarSite";
import { useAuth } from "../../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import interestsValues from "../../Assets/interests.json";
import { useState } from "react";

function ProfileSettings() {

  function handleInterests(value) {
    console.log("Selected Interests " + interests);
    SetSelectedInterests((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  }

  const { token } = useAuth();
  let tokenDecoded = jwtDecode(token);
  let interest = tokenDecoded ? tokenDecoded["interests"] : null;
  let interestArray = interest ? JSON.parse(interest) : null;

    const [ username, setUsername ] = useState(tokenDecoded["username"]);
    const [ email, setEmail ] = useState(tokenDecoded["email"]);
    const [interests, SetSelectedInterests] = useState([]);
    
  const handlesubmit = async (e: React.FormEvent) => { 
    const response = await fetch(
        "http://localhost:3000/api/users/updated-profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, interests }),
        }
      );
      if (response.ok) {
        console.log("L'enregistrement marche ", response);
      } else {
        console.error("l'enregistrement ne marche pas :", response)
      }

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
                    
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                          Username
                        </label>
                        <input
                          type="username"
                          className="form-control"
                          id="username"
                          placeholder={tokenDecoded["username"]}
                          onChange={(e) => setUsername(e.target.value)}
                          value={username}
                        />
                      </div>
                      <div className="mb-3">
                        <h6 className="form-label">interests</h6>
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
                          placeholder={tokenDecoded["email"]}
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                        />
                      </div>
                      {/* <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          Mot de passe
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          placeholder="Password"
                        />
                      </div> */}
                      {/* <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="default-remember"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="default-remember"
                        >
                          Se souvenir de moi
                        </label>
                      </div> */}
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
