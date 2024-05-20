import { faImages, faPersonHiking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import "./Buttons.css";
import { Link } from "react-router-dom";



export function ExploreAndHikeButton() {
  const [language, setLanguage] = useState("en");
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
        setLanguage(storedLanguage);
    }
}, []);

  return (
    <div className="explore-hike-nav-container">
      <Link className="explore-hike-nav-button" to="/gallery">
        <span className="explore-hike-nav-text">{language === "en" ? "Gallery" : "Galería"}</span>
        <FontAwesomeIcon icon={faImages} />
      </Link>
      <Link
        className="explore-hike-nav-button explore-hike-nav-button-right"
        to="/hikes"
      >
        <FontAwesomeIcon icon={faPersonHiking} />
        <span className="explore-hike-nav-text">{language === "en" ? "Hikes" : "Excursiones"}</span>
      </Link>
    </div>
  );
}
