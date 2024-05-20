import React, { useEffect, useState } from "react";
import ibrahimProfileImage from "../assets/ibrahimProfileImage.JPG";

const IbrahimAboutMe = () => {
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
	// Inline CSS styles
	const containerStyle = {
		textAlign: "center", // Center text and inline elements
		maxWidth: "1200px", // Maximum width of the container
		marginLeft: "auto", // Automatically adjust left margin
		marginRight: "auto", // Automaticallyg adjust right margin
		padding: "0 10px", // Add some padding on the sides
	};

	const sectionStyle = {
		margin: "20px 0", // Add some vertical margin to sections
	};

	// Style for the circular image
	const circularImageStyle = {
		maxWidth: "100px", // Resize the image to a smaller size
		height: "100px", // Ensure the height is the same as maxWidth for a circle
		borderRadius: "50%", // Make the image circular
		objectFit: "cover", // Ensure the aspect ratio is maintained
	};

	return (
		<div className="prf-pages">
			<header>
				<h1>Ibrahim</h1>
			</header>
			<main>
				<section style={sectionStyle}>
					<img src={ibrahimProfileImage} alt="Description of the image" style={circularImageStyle} />

					{language === "en" ? (
						<p>
							Hello, I'm Ibrahim. I'm a senior computer science student at the University at Buffalo. I currently work
							at UBIT as a student assistant. Outside of work and school, I enjoy the outdoors, playing video games,
							going to the gym, and flipping cars as a side hustle.
						</p>
					) : (
						<p>
							Hola, soy Ibrahim. Soy estudiante de informática de último año en la Universidad de Buffalo. Actualmente
							trabajo en UBIT como asistente de estudiante. Fuera del trabajo y la escuela, disfruto estar al aire
							libre, jugar videojuegos, ir al gimnasio y comprar y vender coches como trabajo secundario.
						</p>
					)}
				</section>
			</main>
			<footer>
				{language === "en" ? <p>Contact me at iallahbu@buffalo.edu</p> : <p>Contáctame en iallahbu@buffalo.edu</p>}{" "}
			</footer>
		</div>
	);
};

export default IbrahimAboutMe;
