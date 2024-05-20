import React, { useEffect, useState } from "react";
import Smaranpfp from "../assets/Melony-pfp.jpg";

const AboutSmaran = () => {
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
	return (
		<div className="prf-pages">
			<main>
				<h1>Smaran Vedantam</h1>
				<img src={Smaranpfp} alt="Commiting Melonies" />
				<section>
					{language === "en" ? (
						<p>
							Hello, I'm Smaran. I'm a junior Computer Science BS student at the University of Buffalo.
							<br />I love playing and watching Minecraft in my free time. When I'm not free I work as a Student
							Assistant for UBIT and TA for CSE 220.
						</p>
					) : (
						<p>
							¡Hola, soy Smaran! Soy estudiante de tercer año de Ciencias de la Computación en la Universidad de
							Buffalo.
							<br />
							Me encanta jugar y ver Minecraft en mi tiempo libre. Cuando no estoy libre, trabajo como Asistente de
							Estudiante para UBIT y TA para CSE 220.
						</p>
					)}
				</section>
			</main>
			<footer>
				{language === "en" ? <p>Contact me at smaranve@buffalo.edu</p> : <p>Contáctame en smaranve@buffalo.edu</p>}{" "}
			</footer>
		</div>
	);
};
export default AboutSmaran;
