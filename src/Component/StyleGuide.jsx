import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../Component/StyleGuide.css";
import Xbutton from "../assets/Xbutton.png";
import sgNavBar from "../assets/StyleGuideNavbar.png";
import sgDropDown from "../assets/StyleGuideNavbarDropDown.png";
import sgLayout from "../assets/StyleGuideLayout.png";
import BadFeedback from "../assets/afterFeedback.png";
import GoodFeedback from "../assets/goodFeedback.png";
import BeforeFeedback from "../assets/beforeFeedback.png";
import CommentImg from "../assets/styleguide-inline-help-comment.png";
import FindFriendImg from "../assets/styleguide-inline-help-find-friend.png";
import "../App.css";
import SpanishDropdown from "../assets/spanish-drop.png";
import SpanishGallery from "../assets/spanish-gallery.png";
import SpanishBeforeFeedback from "../assets/spanish-before-feedback.png";
import SpanishBadFeedback from "../assets/spanish-bad-feedback.png"
import SpanishGoodFeedback from "../assets/spanish-good-feedback.png"
import SpanishInLine1 from "../assets/spanish-inline-1.png"
import SpanishFindFriend from "../assets/spanish-find-friend.png"

const StyleGuide = () => {
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

	return (
		<div className="full" style={{ display: "flex", "justify-content": "center" }}>
			<div className="sg-container">
				{/* Font Styles */}
				{language === "en" ? (
					<section className="sg-section">
						<header className="sg-section-header">Fonts and Font Sizes</header>
						<h1 className="sg-font-header">h1. Heading (26px Roboto Medium)</h1>
						<h2 className="sg-font-header">h2. Heading (20px Roboto Medium)</h2>
						<h3 className="sg-font-header">h3. Heading (16px Roboto Medium)</h3>
						<h4 className="sg-font-header">h4. Heading (12px Roboto Medium)</h4>
						<h5 className="sg-font-header">h5. Heading (10px Roboto Medium)</h5>
						<h6 className="sg-font-header">h6. Heading (8px Roboto Medium)</h6>
						<p className="sg-font-body">Body font (12px Open Sans Normal)</p>
					</section>
				) : (
					<section className="sg-section">
						<header className="sg-section-header">Fuentes y Tamaños de Fuentes</header>
						<h1 className="sg-font-header">h1. Título (26px Roboto Medium)</h1>
						<h2 className="sg-font-header">h2. Título (20px Roboto Medium)</h2>
						<h3 className="sg-font-header">h3. Título (16px Roboto Medium)</h3>
						<h4 className="sg-font-header">h4. Título (12px Roboto Medium)</h4>
						<h5 className="sg-font-header">h5. Título (10px Roboto Medium)</h5>
						<h6 className="sg-font-header">h6. Título (8px Roboto Medium)</h6>
						<p className="sg-font-body">Cuerpo de texto (12px Open Sans Normal)</p>
					</section>
				)}

				{/* Layout and Navigation Templates */}

				<section className="sg-section">
					<header className="sg-section-header">{language === "en" ? "Navigation/Layout" : "Navegación/Diseño"}</header>
					<p>
						{language === "en"
							? "The navigation bar is a streamlined tool for site traversal, prominently featuring the Trek logo on the left, which doubles as a home button. Directly accessible icons for messages, friends, and user profiles facilitate quick navigation to these key areas, allowing users to seamlessly switch contexts within the web app. The navigation bar overlays the top of the page, with a dark theme to minimize distraction and maximize visibility. Interaction is intuitive: icons respond to user hover,and an expandable menu, accessible via an arrow icon, unfurls additional options like 'About', 'Style Guide' and 'Logout', maintaining an organized space and a consistent z-index hierarchy."
							: "La barra de navegación es una herramienta optimizada para la navegación del sitio, presentando destacadamente el logo Trek en la izquierda, que también sirve como botón de inicio. Iconos accesibles directamente para mensajes, amigos y perfiles de usuario facilitan la navegación rápida a estas áreas clave, permitiendo a los usuarios cambiar de contexto de manera fluida dentro de la aplicación web. La barra de navegación se superpone en la parte superior de la página, con un tema oscuro para minimizar la distracción y maximizar la visibilidad. La interacción es intuitiva: los iconos responden al desplazamiento del usuario, y un menú desplegable, accesible a través de un icono de flecha, despliega opciones adicionales como 'Acerca de', 'Guía de Estilo' y 'Cerrar Sesión', manteniendo un espacio organizado y una jerarquía de z-index coherente."}
					</p>
					<br></br>
					<p>{language === "en" ? "Navigation Bar Example:" : "Ejemplo de Barra de Navegación:"}</p>
					<div>
						<img
							src={sgNavBar}
							alt="Example of Navigation Bar with Trek logo on the left"
							style={{ margin: "10px", maxWidth: "100%", height: "auto" }}
						/>
						<br></br>
						<p>
							{language === "en"
								? "Navigation Bar Dropdown menu example:"
								: "Ejemplo de Menú Desplegable de Barra de Navegación:"}
						</p>
						<img
							src={language === "en" ? sgDropDown : SpanishDropdown}
							alt="Example of Dropdown Menu"
							style={{ margin: "10px", maxWidth: "50%", height: "50%" }}
						/>
					</div>

					<br></br>
					<br></br>
					<p>
						{language === "en"
							? "Ejemplo de Menú Desplegable de Barra de Navegación:The homepage is designed with user interactivity in mind, providing category tabs like 'Trail Hikes,' 'Mountains,' 'Lakes,' 'Forests,' and 'Day Hikes' for filtering the gallery view. Users can switch between 'Gallery' and 'Hikes' view to tailor the content display to their preference, enhancing the user experience with customization. Posts are presented in a responsive grid format that dynamically adjusts to different screen sizes. This layout maintains a cohesive structure, ensuring a seamless browsing experience. Users can sort the displayed posts from the newest to oldest, giving them control over how they explore the content. The addition icon (+) in the corner is a call-to-action, inviting users to contribute new posts. This interactivity is a key part of the site’s navigation, facilitating a participatory and community-driven atmosphere."
							: "La página de inicio está diseñada teniendo en cuenta la interactividad del usuario, proporcionando pestañas de categorías como 'Excursiones por Senderos', 'Montañas', 'Lagos', 'Bosques' y 'Excursiones de un Día' para filtrar la vista de la galería. Los usuarios pueden cambiar entre la vista de 'Galería' y 'Excursiones' para adaptar la visualización del contenido a su preferencia, mejorando la experiencia del usuario con la customización. Las publicaciones se presentan en un formato de cuadrícula receptivo que se ajusta dinámicamente a diferentes tamaños de pantalla. Este diseño mantiene una estructura cohesiva, garantizando una experiencia de navegación sin problemas. Los usuarios pueden ordenar las publicaciones mostradas de la más nueva a la más antigua, dándoles control sobre cómo exploran el contenido. El icono de adición (+) en la esquina es un llamado a la acción, invitando a los usuarios a contribuir con nuevas publicaciones. Esta interactividad es una parte clave de la navegación del sitio, facilitando una atmósfera participativa y comunitaria."}
					</p>
					<div>
						<br></br>
						<p>{language === "en" ? "Layout Example:" : "Ejemplo de Diseño:"}</p>
						<img
							src={language === "en" ? sgLayout : SpanishGallery}
							alt="Example of Layout"
							style={{ margin: "10px", maxWidth: "50%", height: "50%" }}
						/>
					</div>
					{/* CSS Snippet for Navigation Bar */}
					<br></br>

					<p>
						{language === "en"
							? "Navigation Bar CSS Code Snippets:"
							: "Fragmentos de Código CSS para Barra de Navegación:"}
					</p>
					<br></br>
					<div className="sg-code">
						<pre>
							<code>
								{`
.sidenav ul {
  list-style-type: none;
  padding: 5px;
  margin: 0px;
  margin-top: 0px;
  }
.sidenav-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 15px;
  padding: 10px;
}
.side-menu-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between; 
  width: 100%;
  list-style-type: none;
  
.iconStyle = {
    height: "65px",
    width: "65px",
    cursor: "pointer",
    alignItems: "center",
  };

.expandArrowStyle = {
    alignItems: "center",
    marginRight: "10px",
    marginBottom: "17px",
    height: "50px",
  };

.dropdownStyle = {
    display: isDropdownVisible ? "block" : "none",
    position: "absolute",
    top: "60px",
    right: "20px",
    backgroundColor: "#FFF",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
    zIndex: 1001,
  };

.buttonStyle = {
    display: "block",
    backgroundColor: "#F0F0F0",
    color: "#333",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "5px 0",
    width: "100%",
    textAlign: "left",
  };
}`}
							</code>
						</pre>
					</div>
				</section>

				{/* Color Palette and Use */}
				<section className="sg-section-color-palette">
					<header className="sg-section-header">
						{language === "en" ? "Color Palette and Use" : "Ejemplo de Diseño:"}
					</header>
					<div className="section-body">
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#405644" }}></div>
							<span className="color-description">
								{language === "en" ? "Body (Background) #405644" : "Fondo (Background) #405644"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#1E1E1E" }}></div>
							<span className="color-description">
								{language === "en" ? "Navbar (Background) #1E1E1E" : "Barra de Navegación (Background) #1E1E1E"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "rgba(30, 30, 30, 0.55)" }}></div>
							<span className="color-description">
								{language === "en"
									? "Modal (Background) rgba(30, 30, 30, 0.55)"
									: "Modal (Background) rgba(30, 30, 30, 0.55)"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#000000" }}></div>
							<span className="color-description">
								{language === "en" ? "Action Button (Background) #000000" : "Botón de Acción (Background) #000000"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#800000" }}></div>
							<span className="color-description">
								{language === "en" ? "Danger Button (Background) #800000" : "Botón de Peligro (Background) #800000"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#000000" }}></div>
							<span className="color-description">
								{language === "en"
									? "Text and Icons Backgrounds (Color) #000000"
									: "Fondos de Texto e Iconos (Color) #000000"}
							</span>
						</div>
						<div className="color-item">
							<div className="color-circle" style={{ backgroundColor: "#FFFFFF" }}></div>
							<span className="color-description">
								{language === "en"
									? "Text and Icons on Dark Backgrounds (Color) #FFFFFF"
									: " Texto e Iconos sobre Fondos Oscuros (Color) #FFFFFF"}
							</span>
						</div>
					</div>
				</section>

				{/* Popups and Modals */}
				<section className="sg-section-color-palette">
					<header className="sg-section-header">{language === "en" ? "Popups and Modals" : "Popups y Modales"}</header>
					<p>
						{language === "en"
							? "Popups are will be rendered as modals in this web app. Modal content will appear as a box overlaying content in the background, as shown below, where the size is determined by the content within the modal. All content behind the modal will be blurred and unclickable. The only way to close the modal is by clicking the 'X' icon in the top left corner of the modal. The Z-axis will be set to 1000 to ensure the modal is layered over everything else on the page. The content behind the modal will darken in color slightly emphasize the modal itself."
							: "Los popups se representarán como modales en esta aplicación web. El contenido del modal aparecerá como un cuadro superpuesto sobre el contenido en el fondo, como se muestra a continuación, donde el tamaño está determinado por el contenido dentro del modal. Todo el contenido detrás del modal se difuminará e inhabilitará para hacer clic. La única forma de cerrar el modal es haciendo clic en el icono 'X' en la esquina superior izquierda del modal. El eje Z se establecerá en 1000 para asegurar que el modal esté superpuesto sobre todo lo demás en la página. El contenido detrás del modal se oscurecerá ligeramente para enfatizar el modal en sí."}
						<br /> <br />
						{language === "en" ? "Example:" : "Ejemplo:"}
						<br />
						<br />
						<>
							<div className="sg-modal-overlay">
								<div className="sg-modal-content">
									<img src={Xbutton} alt="X button" className="sg-modal-close-button"></img>
									<h3 className="sg-modal-header-text">
										{language === "en" ? "Delete your profile?" : "Borar tu perfil?"}
									</h3>
									<p className="sg-modal-dialogue-text">
										{language === "en"
											? "Are you sure you want to continue? This action cannot be undone."
											: "¿Estás seguro de que quieres continuar? Esta acción no se puede deshacer."}
									</p>
									<div className="buttonsArea">
										<button className="noButton">No</button>
										<button className="yesButton">{language === "en" ? "No" : "Sí"}</button>
									</div>
								</div>
							</div>
						</>
					</p>
					<br /> <br />
					<div>
						{language === "en"
							? "Navigation Bar CSS Code Snippets:"
							: "Fragmentos de Código CSS para Barra de Navegación:"}
					</div>
					<br /> <br />
					<div className="sg-code">
						.sg-modal-overlay <span>&#123;</span> <br />
						&emsp;width: 100%; <br />
						&emsp;height: 100%; <br />
						&emsp;background-color: rgba(0, 0, 0, 0.25); <br />
						&emsp;backdrop-filter: blur(5px); <br />
						&emsp;display: flex; <br />
						&emsp;justify-content: center; <br />
						&emsp;align-items: center; <br />
						&emsp;z-index: 1000; <br />
						<span>&#125;</span>
						<br /> <br />
						.sg-modal-content <span>&#123;</span> <br />
						&emsp;position: relative; <br />
						&emsp;background-color: #1e1e1ee7; <br />
						&emsp;padding: 20px; <br />
						&emsp;border-radius: 15px; <br />
						&emsp;box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26); <br />
						&emsp;width: fit-content; <br />
						<span>&#125;</span>
						<br /> <br />
						.sg-modal-close-button <span>&#123;</span> <br />
						&emsp;position: absolute; <br />
						&emsp;top: 10px; <br />
						&emsp;left: 10px; <br />
						&emsp;width: 40px; <br />
						&emsp;border: none; <br />
						&emsp;background: none; <br />
						&emsp;color: white; <br />
						&emsp;font-size: 30px; <br />
						&emsp;cursor: pointer; <br />
						<span>&#125;</span>
						<br /> <br />
						.sg-modal-close-button:hover <span>&#123;</span> <br />
						&emsp;opacity: 80%; <br />
						<span>&#125;</span>
						<br /> <br />
						.sg-modal-header-text <span>&#123;</span> <br />
						&emsp;margin-bottom: 20px; <br />
						&emsp;color: #ffffff; <br />
						<span>&#125;</span>
						<br /> <br />
						.sg-modal-dialogue-text <span>&#123;</span> <br />
						&emsp;font-size: 20px; <br />
						&emsp;color: #FFFFFF; <br />
						<span>&#125;</span>
						<br />
					</div>
				</section>

				{/* Treatment of Feedback */}
				<section className="sg-section-color-palette">
					<header className="sg-section-header">
						{language === "en" ? "Treatment of Feedback" : "Tratamiento de Feedback"}
					</header>
					<p>
						{language === "en"
							? "Feedback is essential for users to understand that something has happened after clicking a button or if something has gone wrong. For example, when trying to login with invalid credentials, the user must be informed that there was an error. This allows the user to gain a sense of progress. Bad feedback for errors or invalid inputs will be colored with the `Danger` color #800000. Good feedback on successful activities by the user will be colored in #FFFFFF."
							: "El feedback es esencial para que los usuarios entiendan que algo ha sucedido después de hacer clic en un botón o si algo ha salido mal. Por ejemplo, al intentar iniciar sesión con credenciales inválidas, el usuario debe ser informado de que hubo un error. Esto permite al usuario obtener una sensación de progreso. El feedback negativo para errores o entradas inválidas se coloreará con el color `Peligro` #800000. El feedback positivo sobre actividades exitosas realizadas por el usuario se coloreará en #FFFFFF."}
					</p>
					<br />
					<br />
					{language === "en" ? "Examples:" : "Ejemplos:"}
					<br />
					<br />
					<div className="sg-image-container">
						<img
							src={language === "en" ? BeforeFeedback : SpanishBeforeFeedback}
							alt="Before feedback"
							className="sg-image"
						/>
						<label className="sg-label">{language === "en" ? "Before Feedback" : "Antes del Feedback"}</label>
					</div>
					<div className="sg-image-container">
						<img src={language === "en" ? BadFeedback : SpanishBadFeedback} alt="Bad feedback" className="sg-image" />
						<label className="sg-label">
							{language === "en" ? "After Bad Feedback" : "Después del Feedback Negativo"}
						</label>
					</div>
					<div className="sg-image-container">
						<img src={language === "en" ? GoodFeedback : SpanishGoodFeedback} alt="Goof feedback" className="sg-image" />
						<label className="sg-label">
							{language === "en" ? "After Good Feedback" : "Después del Feedback Positivo"}
						</label>
					</div>
				</section>

				{/* Methods for Inline Help */}
				<section className="sg-section">
					<header className="sg-section-header">
						{language === "en" ? "Methods for Inline Help" : "Métodos para Ayuda en Línea"}
					</header>
					<p>
						{language === "en"
							? "Inline help aims to make the user experience more intuitive and efficient by offering help at the point of need. Providing information about a input field with good placeholder text enables the user to understand its function better."
							: "La ayuda en línea tiene como objetivo hacer que la experiencia del usuario sea más intuitiva y eficiente al ofrecer ayuda en el punto de necesidad. Proporcionar información sobre un campo de entrada con un buen texto de marcador de posición permite al usuario comprender mejor su función."}
						<br />

						<br />
						<br />
						<label className="sg-label">{language === "en" ? "Examples:" : "Ejemplos:"}</label>
						<br />
						<br />
					</p>
					<div className="sg-image-container">
						<label className="sg-label">{language === "en" ? "Inline text" : "Texto en Línea"}</label>
						<img src={language === "en" ? CommentImg : SpanishInLine1} alt="Inline text for comments" style={{ width: "30%" }} />
						<p>
							{language === "en"
								? "The Inline Text `What do you think?` informs the user they can informs the user they can provide feedback to the post by liking and commenting."
								: "El Texto en Línea `¿Qué opinas?` informa al usuario que pueden proporcionar comentarios sobre la publicación dando like y comentando."}
						</p>
					</div>

					<div className="sg-image-container">
						<label className="sg-label">
							{language === "en" ? "Placeholder Text" : "Texto de Marcador de Posición"}
						</label>
						<img src={language === "en" ? FindFriendImg: SpanishFindFriend} alt="Placeholder text for find-friedn search bar" style={{ width: "30%" }} />
						<p>
							{language === "en"
								? "The Placeholder Text `Find a friend` informs the user they can use the search bar to search for a friend from their friends list."
								: "El Texto de Marcador de Posición `Busca un amigo` informa al usuario que pueden usar la barra de búsqueda para buscar un amigo de su lista de amigos."}
						</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default StyleGuide;
