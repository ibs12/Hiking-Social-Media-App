import React, { useState, useEffect } from "react";
import RobertImage from "../assets/Robert.jpeg";

const RobertAboutMe = () => {
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
				<h1>Robert Reyes-Enamorado</h1>
				<img src={RobertImage} alt="Robert Reyes-Enamorado" />
			</header>
			<main>
				<section>
					<p>
						{language === "en" ? (
							<>
								I am senior Computer Science student at the University at Buffalo. My main interests lie in mobile and
								web development. I have no preference on the frontend or the backend, and I gained experience in
								fullstack development through my internship at CodePath.org, where I learned how use React for the
								frontend and Postgres, Express.js and Node.js for the backend. Through personal projects, I have also
								learned how to build cross-platform mobile applications using React Native. My main goal as a future
								developer is to build mobile or web applications that are fluid, responsive, accessible, and easy to use
								for the general population.
							</>
						) : (
							<>
								Soy estudiante de último año de Ciencias de la Computación en la Universidad de Buffalo. Mis intereses
								principales están en el desarrollo móvil y web. No tengo preferencia en el frontend o el backend, y
								obtuve experiencia en desarrollo fullstack a través de mi pasantía en CodePath.org, donde aprendí a usar
								React para el frontend y Postgres, Express.js y Node.js para el backend. A través de proyectos
								personales, también aprendí a construir aplicaciones móviles multiplataforma utilizando React Native. Mi
								objetivo principal como futuro desarrollador es construir aplicaciones móviles o web que sean fluidas,
								receptivas, accesibles, y fáciles de usar para la población en general.
							</>
						)}
					</p>
				</section>
			</main>
			<footer>
				<p>Contact me at rareyese@buffalo.edu</p>
			</footer>
		</div>
	);
};

export default RobertAboutMe;
