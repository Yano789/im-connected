import DashboardBody from "../DashboardBody/DashboardBody";
import Header from "../../TopHeader/Header/Header";
import { useEffect,useState } from "react";
import i18next from "i18next";
import { API_ENDPOINTS } from "../../config/api.js";
function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSetLanguage = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.USER_GET,
          {
            credentials: "include",
          }
        );
        const user = await response.json();

        const preferredLang = user?.preferences?.preferredLanguage || "en";
        console.log(preferredLang);
        if (i18next.language !== preferredLang) {
          await i18next.changeLanguage(preferredLang);
        }
      } catch (err) {
        console.error("Failed to fetch user or set language:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSetLanguage();
  }, []);

  if (loading) return null;
  return (
    <div>
      <Header />
      <DashboardBody />
    </div>
  );
}
export default Dashboard;
