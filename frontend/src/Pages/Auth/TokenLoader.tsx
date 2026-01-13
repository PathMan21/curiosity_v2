import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function TokenLoader() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlRefreshToken = searchParams.get("refreshToken");
    console.log("rentre dans la fonction");

    if (urlToken) {
      setToken(urlToken, urlRefreshToken || undefined);
      navigate("/complete-inscription", { replace: true });
    } else {
      console.log("est censé se rediriger sur login");
      navigate("/login", { replace: true });
    }
  }, [searchParams, setToken, navigate]);

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
