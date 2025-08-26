import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    navigate("/bot-quiz", { replace: true, state: location.state || null });
  }, [navigate, location.state]);
  return null;
}
