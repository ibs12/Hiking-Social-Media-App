import React, { useEffect, useState } from "react";
import DevonImage from "../assets/Devon.png";

const DevonAboutMe = () => {
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
	return (
		<div className="prf-pages">
			<header>
				<h1>Devon Morlok</h1>
				<img className="devon-image" src={DevonImage} alt="Devon Morlok" />
			</header>
			<main>
				<section>
					{language === "en" ? (
						<p>
							Hello, I'm Devon and I am a senior Computer Science student at the University at Buffalo.
							<br />
							I currently work as an IT Computer Science intern at Moog, and primarily work with .NET Web Apps.
							<br />
							Outside of work/school, I enjoy going to the gym, hiking, reading, and spending time with my
							friends/family.
						</p>
					) : (
						<p>
							Hola, soy Devon y soy estudiante de último año de Ciencias de la Computación en la Universidad de Buffalo.
							<br />
							Actualmente trabajo como pasante de informática en Moog, y principalmente trabajo con aplicaciones web
							.NET.
							<br />
							Fuera del trabajo y la escuela, disfruto ir al gimnasio, hacer senderismo, leer y pasar tiempo con mis
							amigos/familia.
						</p>
					)}
				</section>
			</main>
			<footer>
				<p>Contact me at dmorlok@buffalo.edu</p>
			</footer>
		</div>
	);
};

export default DevonAboutMe;
