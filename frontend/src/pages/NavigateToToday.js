
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NavigateToToday = () => {
  const { stationName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    navigate(`/charging-queue/${encodeURIComponent(stationName)}/${today}`, { replace: true });
  }, [stationName, navigate]);

  return null;
};

export default NavigateToToday;
