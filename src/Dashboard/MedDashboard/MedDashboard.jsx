import "./MedDashboard.css";
import MedDashboardEntry from "../MedDashboardEntry/MedDashboardEntry";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function DashboardItem() {
  const [medications, setMedications] = useState([]);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/v1/medication/medications",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medications");
        }

        const data = await response.json();
        setMedications(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    fetchMedications();
  }, []);

  return (
    <div className="cardDiv">
      <p className="card-header">{t("MedDashboardHeader")}</p>
      <p className="card-subheader">{t("MedDashboardSubHeader")}</p>

      {medications.map((med, index) => (
        <div key={index} className="cardDetails">
          <MedDashboardEntry
            medicineName={med.name || t("Unknown Medication")}
            medicineDosage={med.dosage || t("Unknown Dosage")}
          />
          <ul>
            {med.dosages.map((d, idx) => (
              <li key={d._id || idx}>
                {t("Time")} {d.time} — {t("Taken")} {d.taken ? t("Yes") : t("No")}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DashboardItem;
