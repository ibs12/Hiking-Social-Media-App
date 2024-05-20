import React, { useState, useEffect } from "react";
import JohnProfileImg from "../assets/john-profile.jpg";

const PrfilePageJohn = () => {
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
	return (
		<div className="profileWrapper">
			<div className="profileContainer">
				<img src={JohnProfileImg} alt="Outdoor Windmills" width="250px" />
				<h1>John Abramo</h1>
				<p>
					{language === "en" ? (
						<>
							I am a senior at the University at Buffalo studying Computer Science. I am a TA for three courses. I enjoy
							spending time outdoors. Recently, I've been trying to learn how to golf.
						</>
					) : (
						<>
							Soy estudiante de último año en la Universidad de Buffalo estudiando Ciencias de la Computación. Soy
							asistente de enseñanza para tres cursos. Disfruto pasar tiempo al aire libre. Recientemente, he estado
							tratando de aprender a jugar golf.
						</>
					)}
				</p>
			</div>
		</div>
	);
};

export default PrfilePageJohn;
