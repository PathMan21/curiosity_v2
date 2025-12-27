import FooterSite from "../../Components/FooterSite";
import NavbarSite from "../../Components/NavbarSite";
import { useAuth } from "../../Context/AuthContext";
import { jwtDecode } from "jwt-decode";

function ProfileSettings() {
    
      const { token } = useAuth();
      let tokenDecoded = jwtDecode(token);
      let interest = tokenDecoded['interests'];
        let interestArray = JSON.parse(interest);

      console.log(tokenDecoded);

    return(
        <>
        <NavbarSite></NavbarSite>
        <div className="bg-light min-vh-100 py-5">

        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title mb-4">Paramètres de profil</h3>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input type="username" className="form-control" id="username" placeholder="username" value={ tokenDecoded['username'] } />
                                </div>
                                <div className="mb-3">
                                    <h6 className="form-label">interests</h6>
                                            {interestArray.map((object, i) => (
                                            <div className="form-check" key={i}>
                                                <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id={`interest-${i}`}
                                                value={object}
                                                />
                                                <label className="form-check-label" htmlFor={`interest-${i}`}>
                                                {object}
                                                </label>
                                            </div>
                                            ))}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="email" placeholder="Email" value={ tokenDecoded['email'] } />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <input type="password" className="form-control" id="password" placeholder="Password" />
                                </div>
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="default-remember" />
                                    <label className="form-check-label" htmlFor="default-remember">
                                        Se souvenir de moi
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Valider les modifications</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <FooterSite></FooterSite>
    </>
    )

}

export default ProfileSettings;
