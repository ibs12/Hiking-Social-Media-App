import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import ExpandArrow from "../assets/ExpandArrow.png";
import FriendsIcon from "../assets/FriendsIcon.png";
import MessagesIcon from "../assets/MessagesIcon.png";
import NavLogo from "../assets/NavLogo.png";
import UserIcon from "../assets/UserIcon.png";

const Navbar = ({ toggleModal, logout }) => {
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [picture, setPicture] = useState(UserIcon);
	const [yourUserData, setYourUserData] = useState(null);
	const [hasNewMessage, setHasNewMessage] = useState(false);
	const [hasNewRequest, setHasNewRequest] = useState(false);

	const [language, setLanguage] = useState("en");

	const handleChangeLanguage = (selectedLanguage) => {
		setLanguage(selectedLanguage);
		localStorage.setItem("language", selectedLanguage);
		window.location.reload();
	};

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const iconStyle = {
		height: "65px",
		width: "65px",
		cursor: "pointer",
		alignItems: "center",
	};

	const expandArrowStyle = {
		alignItems: "center",
		marginRight: "10px",
		marginBottom: "17px",
		height: "50px",
	};

	const dropdownStyle = {
		display: isDropdownVisible ? "block" : "none",
		position: "absolute",
		top: "60px",
		right: "20px",
		backgroundColor: "#FFF",
		padding: "5.5px 10px",
		borderRadius: "5px",
		boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
		zIndex: 1001,
	};

	const buttonStyle = {
		display: "block",
		backgroundColor: "#F0F0F0",
		color: "#333",
		border: "none",
		padding: "8px 16px",
		borderRadius: "4px",
		cursor: "pointer",
		margin: "4.5px 0",
		width: "100%",
		textAlign: "left",
		fontFamily: "Roboto, sans-serif",
		fontWeight: 500,
	};

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result && result?.attributes) {
					setPicture(result?.attributes?.picture || UserIcon);
					setYourUserData(result);
				}
			})
			.catch((error) => {});
	}, []);

	useEffect(() => {
		const interval = setInterval(fetchGroups, 1000);

		return () => clearInterval(interval);
	}, [yourUserData]);

	useEffect(() => {
		const interval = setInterval(fetchRequests, 2000);

		return () => clearInterval(interval);
	}, []);

	const fetchGroups = async () => {
		try {
			const response = await fetch("https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups", {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch groups");
			}
			const data = await response.json();
			const filteredGroups = data[0]?.filter(
				(group) =>
					["dm", "hm"].includes(group.name) &&
					group.attributes.chatters.includes(yourUserData?.id) &&
					group.attributes.hasNewMessage[yourUserData?.id]
			);
			setHasNewMessage(filteredGroups.length > 0);
		} catch (error) {
			console.error("Error fetching groups:", error);
		}
	};

	const fetchRequests = () => {
		fetch(`${process.env.REACT_APP_API_PATH}/connections?toUserID=${sessionStorage.getItem("user")}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then(
				(result) => {
					// Check if there are any incoming friend requests
					const hasRequests = result[0].some((conn) => conn.attributes.status === "Pending");
					setHasNewRequest(hasRequests);
				},
				(error) => {
					console.error("Error fetching friend requests:", error);
				}
			);
	};

	return (
		<div id="sidenav" className="sidenav">
			<ul id="side-menu-items" className="side-menu-items">
				<li className="pm admin student">
					<Link to="/gallery">
						<img
							src={NavLogo}
							style={iconStyle}
							className="sidenav-icon all-nav-icons"
							alt={language === "en" ? "Home" : "Casa"}
							title={language === "en" ? "Home" : "Casa"}
						/>
					</Link>
				</li>
				<div className="flex-grow-spacer"></div>
				<li className="pm admin">
					<div className="messages-icon-container position-relative">
						<Link to="/messages">
							{hasNewMessage && <FontAwesomeIcon icon={faCircle} className="messages-icon-badge" />}
							<img
								src={MessagesIcon}
								style={iconStyle}
								className="sidenav-icon all-nav-icons"
								alt={language === "en" ? "Messages" : "Mensajes"}
								title={language === "en" ? "Messages" : "Mensajes"}
							/>
						</Link>
					</div>
				</li>
				<li className="pm admin">
					<Link to="/friends">
						{hasNewRequest && <FontAwesomeIcon icon={faCircle} className="messages-icon-badge" />}

						<img
							src={FriendsIcon}
							style={iconStyle}
							className="sidenav-icon all-nav-icons"
							alt={language === "en" ? "Friends" : "Amigos"}
							title={language === "en" ? "Friends" : "Amigos"}
						/>
					</Link>
				</li>
				<li className="pm admin">
					<Link to="/settings">
						<img
							src={picture}
							style={iconStyle}
							className="sidenav-icon nav-user-picture all-nav-icons"
							alt={language === "en" ? "Profile" : "Perfil"}
							title={language === "en" ? "Profile" : "Perfil"}
						/>
					</Link>
				</li>
				<li
					className="pm admin"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setIsDropdownVisible(!isDropdownVisible);
						}
					}}
				>
					<img
						src={ExpandArrow}
						alt={language === "en" ? "More Options" : "Más Opciones"}
						title={language === "en" ? "More Options" : "Más Opciones"}
						style={expandArrowStyle}
						className="all-nav-icons nav-dropdown-arrow"
						onClick={() => setIsDropdownVisible(!isDropdownVisible)}
					/>
				</li>
				{isDropdownVisible && (
					<div style={dropdownStyle}>
						<li className="pm admin" tabIndex={0}>
							<Link to="/about" style={{ textDecoration: "none" }}>
								<button style={buttonStyle}>{language === "en" ? "About" : "Autores"}</button>
							</Link>
						</li>
						<li className="pm admin" tabIndex={0}>
							<Link to="/style-guide" style={{ textDecoration: "none" }}>
								<button style={buttonStyle}>{language === "en" ? "Style Guide" : "Guía de Estilo"}</button>
							</Link>
						</li>
						<li className="pm admin" tabIndex={0}>
							<button
								className="link-button"
								onClick={() => handleChangeLanguage(language === "en" ? "es" : "en")}
								style={buttonStyle}
							>
								{language === "en" ? "Español" : "English"}
							</button>
						</li>
						<li className="pm admin" tabIndex={0}>
							<button className="link-button" onClick={logout} style={buttonStyle}>
								{language === "en" ? "Logout" : "Cerrar Sesión"}
							</button>
						</li>
					</div>
				)}
			</ul>
		</div>
	);
};

export default Navbar;
