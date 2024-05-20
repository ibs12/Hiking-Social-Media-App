import React, { useEffect, useState } from "react";
import "../App.css";
import "./LoginForm.css";
import appLogo from "../assets/Logo.png";
import emailImage from "../assets/Email.png";
import lockIcon from "../assets/lock-icon.png";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";

const LoginForm = ({ setLoggedIn }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [sessionToken, setSessionToken] = useState("");
	const [error, setError] = useState("");


	const navigate = useNavigate();

	// Language States
	const [sloganText, setSloganText] = useState("");
	const [loginText, setLoginText] = useState("");
	const [language, setLanguage] = useState("en");

	// Effect to update login text when language changes
	useEffect(() => {
		if (language === "en") {
			setLoginText("Login");
			setSloganText("A place to hike together");
		} else {
			setSloganText("Aventuremos juntos");
			setLoginText("Inicio de sesión");
		}
	}, [language]);

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const handleChangeLanguage = (selectedLanguage) => {
		setLanguage(selectedLanguage);
		localStorage.setItem("language", selectedLanguage);
	};

	const submitHandler = (event) => {
		// event.preventDefault() prevents the browser from performing its default action
		// In this instance, it will prevent the page from reloading
		// keeps the form from actually submitting as well
		event.preventDefault();

		fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				password,
			}),
		})
			.then((response) => {
				if (response.status === 401) {
					throw new Error("Invalid login credentis.");
				}
				return response.json();
			})
			.then((result) => {
				if (result.userID) {
					// Successfully logged in
					console.log(result);
					// set the auth token and user ID in the session state
					sessionStorage.setItem("token", result.token);
					sessionStorage.setItem("user", result.userID);
					// call setLoggedIn hook from App.jsx to save the login state throughout the app
					setLoggedIn(true);
					setSessionToken(result.token);
					// go to the homepage
					navigate("/gallery");
					window.location.reload();
				}
			})
			.catch((err) => {
				setError(language === "en" ? "Invalid login credentials." : "Credenciales de inicio de sesión inválidas.");
			});
	};
	console.log("language is", language);

	return (
		<body>
			<div className="page-container">
				<div className="container">
					<div className="app-logo-container">
						<div className="header-container">
							<h1 className="trek-header">Trek</h1>
							<img className="trek-logo" src={appLogo} alt="Trek App Logo" />
						</div>
						<p className="logo-text">{sloganText}</p>
					</div>
					<div className="wrapper">
						<div style={{ "font-size": "26px" }} className="title">
							<span style={{ "font-size": "26px", fontFamily: "Roboto, sans-serif", fontWeight: "500" }}>
								{loginText}
							</span>
						</div>
						<form onSubmit={submitHandler}>
							<p className="input-header">{language === "en" ? "Email" : "Correo Electrónico"}</p>
							<div className="row">
								<i className="icon-container">
									<img className="icon" src={emailImage} alt="profile icon"></img>
								</i>
								<input
									className="input-field"
									type="email"
									placeholder={language === "en" ? "example@email.com" : "ejemplo@correo.com"}
									required
									onChange={(event) => setEmail(event.target.value)}
								/>
							</div>

							<p className="input-header">{language === "en" ? "Password" : "Contrazeña"}</p>
							<div className="row">
								<i className="icon-container">
									<img className="icon" src={lockIcon} alt="lock icon"></img>
								</i>
								<input
									className="input-field"
									type="password"
									placeholder="*************"
									required
									onChange={(event) => setPassword(event.target.value)}
								/>
							</div>

							<div className="sub-text justify-start">
								<p className="sub-text">{language === "en" ? "Forgot your password?" : "Olbidaste tu contraseña?"}</p>
								<Link style={{ "padding-left": "4px" }} to="/reset-password" className="sub-text">
									{language === "en" ? "Click Here" : "Haz clic aquí"}
								</Link>
							</div>
							<br />
							<div className="row button">
								<input type="submit" value={language === "en" ? "Login" : "Entrar"} />
							</div>
							<p style={{ "padding-bottom": "15px" }} className="errorMessageText">
								{error}
							</p>
							<p className="sub-text">
								{language === "en" ? "Not on Trek yet? " : "¿Todavía no estás en Trek? "}
								<Link to="/register">{language === "en" ? "Register here" : "Regístrate aquí"}</Link>
							</p>
						</form>
					</div>
					<div className="language-change-box">
						<FontAwesomeIcon icon={faEarthAmericas} className="globe-icon" />
						<p className="sub-text">{language === "en" ? "Language" : "Idioma"}</p>
						<select  value={language} onChange={(e) => handleChangeLanguage(e.target.value)}>
							<option value="en">English</option>
							<option value="es">Español</option>
						</select>
					</div>
				</div>
			</div>
		</body>
	);
};

export default LoginForm;
