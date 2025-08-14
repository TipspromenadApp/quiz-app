import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./registerWelcome.css";

export default function RegisterWelcome() {
  const location = useLocation();
  const navigate = useNavigate();

  const userName =
    location.state?.userName ||
    localStorage.getItem("justRegisteredUser") ||
    "Ny Utforskare";

  useEffect(() => {
    if (location.state?.userName) {
      localStorage.setItem("justRegisteredUser", location.state.userName);
    }
  }, [location.state?.userName]);

  const primaryAction = () =>
    navigate("/login", { state: { justRegistered: true, userName } });

  return (
    <div className="reg-welcome-container">
      <div className="reg-welcome-card">
        <h1 className="reg-welcome-title">Välkommen ombord, {userName}!</h1>
        <p className="reg-welcome-subtitle">
          Vi är så glada att du har valt att bli en del av oss. 
          Din resa mot nya upptäckter börjar här – ta ditt första steg.
        </p>

        <div className="reg-welcome-actions">
          <button
            className="pill-button"
            onClick={() =>
              navigate("/login", {
                state: { justRegistered: true, userName },
              })
            }
          >
            Fortsätt till inloggning
          </button>

          <Link className="back-link" to="/">
            ← Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}

