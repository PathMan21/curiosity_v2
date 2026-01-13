import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function TokenLoader() {
  const [searchParams] = useSearchParams();
  const { setToken, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlRefreshToken = searchParams.get("refreshToken");
    console.log("rentre dans la fonction");

    if (urlToken) {
      setToken(urlToken, urlRefreshToken || undefined);
      // Récupérer le profil complet après avoir défini le token
      fetchUserProfile().then(() => {
        navigate("/complete-inscription", { replace: true });
      }).catch((error) => {
        console.error("Erreur lors du chargement du profil:", error);
        navigate("/complete-inscription", { replace: true });
      });
    } else {
      console.log("est censé se rediriger sur login");
      navigate("/login", { replace: true });
    }
  }, [searchParams, setToken, navigate, fetchUserProfile]);

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement en cours...</p>
      </div>
    </div>
  );
}

export default TokenLoader;
