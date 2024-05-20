import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import lockIcon from "../assets/lock-icon.png";
import appLogo from "../assets/Logo.png";
import emailIcon from "../assets/email-icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faEarthAmericas } from "@fortawesome/free-solid-svg-icons";

const ResetPassword = ({ element}) => {
	const [email, setEmail] = useState("");
	const [gotToken, setGotToken] = useState(false);
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const [language, setLanguage] = useState("en");

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

	const handleResetRequest = (event) => {
		event.preventDefault();

		fetch(`${process.env.REACT_APP_API_PATH}/auth/request-reset`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
			}),
		}).then((res) => {
			if (res.ok) {
				setGotToken(true);
			} else {
				setError(language === "en" ? "Invalid email." : "Correo electrónico inválido.");
			}
		});
	};

	const handleResetPassword = (event) => {
		event.preventDefault();

		fetch(`${process.env.REACT_APP_API_PATH}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token,
				password,
			}),
		}).then((res) => {
			if (res.ok) {
				navigate("/");
			} else {
				setError(language === "en" ? "Invalid token." : "Token inválido.");
			}
		});
	};

	return (
		<>
			{!gotToken ? (
				<body>
					<div className="page-container">
						<div className="container">
							<div className="app-logo-container">
								<div className="header-container">
									<h1 className="trek-header">Trek</h1>
									<img className="trek-logo" src={appLogo} alt="Trek App Logo" />
								</div>
								<p className="logo-text">{language === "en" ? "A place to hike together" : "Aventuremos juntos"}</p>
							</div>
							<div className="wrapper">
								<div className="title">
									<span style={{ fontSize: "26px" }}>
										{language === "en" ? "Let's find your Trek account" : "Busquemos tu cuenta Trek"}
									</span>
								</div>
								<form onSubmit={handleResetRequest}>
									<p className="input-header">{language === "en" ? "Email" : "Correo Electrónico"}</p>
									<div className="row">
										<i>
											<img className="email-icon" src={emailIcon} alt="Icono de correo electrónico" />
										</i>
										<input
											className="input-field"
											type="email"
											placeholder={language === "en" ? "example@email.com" : "ejemplo@correo.com"}
											value={email}
											required
											onChange={(event) => setEmail(event.target.value)}
										/>
									</div>
									<br />
									<div className="row button">
										<input type="submit" value={language === "en" ? "Submit" : "Enviar"} />
									</div>
									<div style={{ paddingBottom: "15px" }}></div>
									<p className="sub-text">
										{language === "en"
											? "Remember your login information?"
											: "¿Recuerdas tu información de inicio de sesión?"}{" "}
										<Link to="/">{language === "en" ? "Login here" : "Iniciar sesión aquí"}</Link>
									</p>
								</form>
							</div>
							<div className="language-change-box">
								<FontAwesomeIcon icon={faEarthAmericas} className="globe-icon" />
								<p className="sub-text">{language === "en" ? "Language" : "Idioma"}</p>
								<select value={language} onChange={(e) => handleChangeLanguage(e.target.value)}>
									<option value="en">English</option>
									<option value="es">Español</option>
								</select>
							</div>
						</div>
					</div>
				</body>
			) : (
				<div className="page-container">
					<body>
						<div className="container">
							<div className="app-logo-container">
								<div className="header-container">
									<h1 className="trek-header">Trek</h1>
									<img className="trek-logo" src={appLogo} alt="Trek App Logo" />
								</div>
								<p className="logo-text">{language === "en" ? "A place to hike together" : "Aventuremos juntos"}</p>
							</div>
							<div className="wrapper">
								<div className="title">
									<span style={{ fontSize: "26px" }}>
										{language === "en" ? "Check your email!" : "¡Revisa tu correo electrónico!"}
									</span>
								</div>
								<form onSubmit={handleResetPassword}>
									<label>
										<p className="input-header">{language === "en" ? "Reset Token" : "Token de Restablecimiento"}</p>
										<div className="row">
											<i>
												<FontAwesomeIcon className="email-icon" icon={faKey} />
											</i>
											<input
												className="input-field"
												type="text"
												placeholder={
													language === "en"
														? "Enter your reset token here.."
														: "Ingresa tu token de restablecimiento aquí.."
												}
												value={token}
												required
												onChange={(event) => setToken(event.target.value)}
											/>
										</div>
									</label>
									<label>
										<p className="input-header">{language === "en" ? "New Password" : "Nueva Contraseña"}</p>
										<div className="row">
											<i className="icon-container">
												<img className="icon" src={lockIcon} alt="Icono de candado" />
											</i>
											<input
												className="input-field"
												type="password"
												placeholder="*************"
												required
												value={password}
												onChange={(event) => setPassword(event.target.value)}
											/>
										</div>
									</label>
									<br />
									<div className="row button">
										<input type="submit" value={language === "en" ? "Submit" : "Enviar"} />
									</div>
									<p style={{ paddingBottom: "15px" }} className="errorMessageText">
										{error}
									</p>
									<p className="sub-text">
										{language === "en"
											? "Remember your login information?"
											: "¿Recuerdas tu información de inicio de sesión?"}{" "}
										<Link to="/">{language === "en" ? "Login here" : "Iniciar sesión aquí"}</Link>
									</p>
								</form>
							</div>
							<div className="language-change-box">
								<FontAwesomeIcon icon={faEarthAmericas} className="globe-icon" />
								<p className="sub-text">{language === "en" ? "Language" : "Idioma"}</p>
								<select value={language} onChange={(e) => handleChangeLanguage(e.target.value)}>
									<option value="en">English</option>
									<option value="es">Español</option>
								</select>
							</div>
						</div>
					</body>
				</div>
			)}
		</>
	);
};

export default ResetPassword;
