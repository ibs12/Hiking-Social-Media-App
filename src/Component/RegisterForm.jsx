import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import emailImage from "../assets/Email.png";
import passwordImage from "../assets/Password.png";
import userImage from "../assets/User.png";
import "./register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";

const RegisterForm = ({ setLoggedIn }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
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

	const navigate = useNavigate();

	const submitHandler = async (event) => {
		event.preventDefault();

		const specialEmailCharRegex = /[!#$%^&*(),?":{}|<>]/;
		const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

		try {
			// Fetch users
			const usersResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!usersResponse.ok) {
				throw new Error(language === "en" ? "Failed to fetch users." : "Error al obtener usuarios.");
			}

			if (specialEmailCharRegex.test(email)) {
				setError(
					language === "en"
						? `Email cannot contain special characters: !#$%^&*(),?":{}|<>`
						: `El correo electrónico no puede contener caracteres especiales: !#$%^&*(),?":{}|<>`
				);
				return;
			}

			const usersData = await usersResponse.json();

			const isEmailTaken = usersData[0].some((user) => user?.email === email);

			if (isEmailTaken) {
				throw new Error(
					language === "en"
						? "Email already exists. Please choose a different email."
						: "Correo electrónico ya existe. Por favor, elige un correo electrónico diferente."
				);
			}

			if (specialCharRegex.test(username)) {
				setError(
					language === "en"
						? `Username cannot contain special characters: !@#$%^&*(),.?":{}|<>`
						: `El nombre de usuario no puede contener caracteres especiales: !@#$%^&*(),.?":{}|<>`
				);
				return;
			}

			const usersWithUsername = usersData[0].filter((user) => user?.attributes?.username);

			// Check username length
			if (username.length > 20) {
				setError(
					language === "en"
						? "Username must be 20 characters or less."
						: "El nombre de usuario debe tener 20 caracteres o menos."
				);
				return;
			}

			const isUsernameTaken = usersWithUsername.some((user) => user?.attributes?.username === username);

			if (isUsernameTaken) {
				throw new Error(
					language === "en"
						? "Username already exists. Please choose a different username."
						: "Nombre de usuario ya existe. Por favor, elige un nombre de usuario diferente."
				);
			}

			if (password !== confirmPassword) {
				setError(language === "en" ? "Passwords do not match." : "Las contraseñas no coinciden.");
				return;
			}

			const registrationResponse = await fetch(`${process.env.REACT_APP_API_PATH}/auth/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
					attributes: {
						username,
					},
				}),
			});

			if (registrationResponse.ok) {
				const result = await registrationResponse.json();
				sessionStorage.setItem("token", result.token);
				sessionStorage.setItem("user", result.userID);
				setLoggedIn(true);
				navigate("/gallery");
				window.location.reload();
			} else {
				throw new Error(language === "en" ? "Unknown error occurred." : "Ocurrió un error desconocido.");
			}
		} catch (error) {
			setError(error.message);
		}
	};

	useEffect(() => {
		if (sessionStorage.getItem("token")) {
			navigate("/gallery");
		}
	}, [navigate]);

	return (
		<div>
			<body>
				<div className="register-background">
					<div className="page-container">
						<div className="container">
							<div className="app-logo-container">
								<div className="header-container">
									<h1 className="trek-header">Trek</h1>
									<img className="trek-logo" src={logo} alt="Logo" />
								</div>
								<p className="logo-text">{language === "en" ? "A place to hike together" : "Aventuremos juntos"}</p>
							</div>
							<div className="wrapper">
								<div className="title" style={{ "font-size": "26px" }}>
									<span style={{ "font-size": "26px", fontFamily: "Roboto, sans-serif", fontWeight: "500" }}>
										{language === "en" ? "Register" : "Registrarse"}
									</span>
								</div>
								<form onSubmit={submitHandler}>
									<p className="input-header">{language === "en" ? "Email" : "Correo Electrónico"}</p>
									<div className="row">
										<i className="icon-container">
											<img className="icon" src={emailImage} alt="Email"></img>
										</i>
										<input
											className="input-field"
											type="email"
											placeholder={language === "en" ? "example@email.com" : "ejemplo@correo.com"}
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<p className="input-header">{language === "en" ? "Username" : "Nombre de Usuario"}</p>
									<div className="row">
										<i className="icon-container">
											<img className="icon" src={userImage} alt="User"></img>
										</i>
										<input
											className="input-field"
											type="text"
											placeholder={language === "en" ? "Username" : "Nombre de Usuario"}
											required
											value={username}
											onChange={(e) => setUsername(e.target.value)}
										/>
									</div>
									<p className="input-header">{language === "en" ? "Password" : "Contraseña"}</p>
									<div className="row">
										<i className="icon-container">
											<img className="icon" src={passwordImage} alt="Password"></img>
										</i>
										<input
											className="input-field"
											type="password"
											placeholder="*************"
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<p className="input-header">{language === "en" ? "Confirm Password" : "Confirmar Contraseña"}</p>
									<div className="row">
										<i className="icon-container">
											<img className="icon" src={passwordImage} alt="Confirm Password"></img>
										</i>
										<input
											className="input-field"
											type="password"
											placeholder="*************"
											required
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
										/>
									</div>
									<br />
									<div className="row button">
										<input type="submit" value={language === "en" ? "Register" : "Registrate"} />
									</div>
									<p style={{ "padding-bottom": "15px" }} className="errorMessageText">
										{error}
									</p>
									<p className="sub-text">
										{language === "en" ? "Already have an account? " : "¿Ya tienes una cuenta? "}{" "}
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
				</div>
			</body>
		</div>
	);
};

export default RegisterForm;
