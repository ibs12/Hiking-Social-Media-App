import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const About = () => {
	const navigate = useNavigate();
	const userToken = sessionStorage.getItem("token");
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		console.log(userToken);
		if (!userToken) {
			navigate("/");
		}
	}, [userToken]);

	const buttonStyle = {
		display: "inline-block",
		backgroundColor: "#F0F0F0",
		color: "#333",
		border: "none",
		padding: "8px 16px",
		borderRadius: "4px",
		cursor: "pointer",
		margin: "10px",
		textAlign: "center",
		fontFamily: "Roboto, sans-serif",
		fontWeight: 500,
	};

	const containerStyle = {
		display: "flex",
		justifyContent: "center",
		flexWrap: "wrap",
		margin: "20px 0",
	};

	const descriptionStyle = {
		backgroundColor: "#fff",
		color: "#333",
		padding: "20px",
		borderRadius: "8px",
		boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
		maxWidth: "800px",
		margin: "50px auto 40px",
		fontFamily: "Roboto, sans-serif",
		fontSize: "18px",
		lineHeight: "1.6",
		textAlign: "justify",
	};

	return (
		<div className="about-page">
			<div style={descriptionStyle}>
				<h2 style={{ textAlign: "center", margin: "0 0 20px" }}>
					{language === "en" ? "Project Description" : "Descripción del Proyecto"}
				</h2>
				{language === "en" ? (
					<p>
						Our web application is a place where nature lovers will be able to gather to plan and share hiking trips.
						Users can engage with two main sections: the "gallery page" and the “hikes page”. The "gallery page" is a
						feed that allows users to post pictures/descriptions relating to hikes they are on/have been on, and other
						users can interact with these posts (like/comment). The “hikes page” is a feed dedicated to posting/planning
						hikes. On this page, posts would include the location where the user is planning to take the hike, a
						description, tags that specify which type of hike is it, and the level of difficulty. Other users can like,
						and comment on these posts as well as join the hike and will be put into a group chat to communicate with
						all hikers part of the hike. Users have the choice to restrict the visibility of their hike and gallery
						posts to friends to protect their privacy and limit people who can join their hike to friends. Once the hike
						is over the post owner can mark it as completed and the post will no longer show up on the “hikes page”.
						Users can see all of their completed and upcoming hikes on their profile page alongside stats like total
						miles hiked, and total hikes completed.
					</p>
				) : (
					<p>
						Nuestra aplicación web es un lugar donde los amantes de la naturaleza podrán reunirse para planificar y
						compartir excursiones de senderismo. Los usuarios pueden interactuar con dos secciones principales: la
						"página de galería" y la "página de excursiones". La "página de galería" es un feed que permite a los
						usuarios publicar imágenes/descripciones relacionadas con las excursiones en las que están o han estado, y
						otros usuarios pueden interactuar con estas publicaciones (dar me gusta/comentar). La "página de
						excursiones" es un feed dedicado a publicar/planificar excursiones. En esta página, las publicaciones
						incluirían la ubicación donde el usuario está planeando realizar la excursión, una descripción, etiquetas
						que especifican qué tipo de excursión es, y el nivel de dificultad. Otros usuarios también pueden dar me
						gusta y comentar estas publicaciones, así como unirse a la excursión y ser incluidos en un chat grupal para
						comunicarse con todos los excursionistas que forman parte de la excursión. Los usuarios tienen la opción de
						restringir la visibilidad de sus publicaciones de excursiones y galería a amigos para proteger su privacidad
						y limitar a las personas que pueden unirse a su excursión a amigos. Una vez que la excursión haya terminado,
						el propietario de la publicación puede marcarla como completada y la publicación ya no aparecerá en la
						"página de excursiones". Los usuarios pueden ver todas sus excursiones completadas y próximas en su página
						de perfil junto con estadísticas como la cantidad total de millas recorridas y la cantidad total de
						excursiones completadas.
					</p>
				)}
				<br></br>

				<h2 style={{ textAlign: "center", margin: "0 0 20px" }}>
					{language === "en" ? "Development Team" : "Equipo de Desarrollo"}
				</h2>
				<div style={containerStyle}>
					<Link to="/about/john" style={{ textDecoration: "none" }}>
						<button style={buttonStyle}>John</button>
					</Link>
					<Link to="/about/robert" style={{ textDecoration: "none" }}>
						<button style={buttonStyle}>Robert</button>
					</Link>
					<Link to="/devonAboutMe" style={{ textDecoration: "none" }}>
						<button style={buttonStyle}>Devon</button>
					</Link>
					<Link to="/about/Smaran" style={{ textDecoration: "none" }}>
						<button style={buttonStyle}>Smaran</button>
					</Link>
					<Link to="/aboutme" style={{ textDecoration: "none" }}>
						<button style={buttonStyle}>Ibrahim</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default About;
