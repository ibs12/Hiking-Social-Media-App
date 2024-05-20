import React, { useState, useEffect, useRef } from "react";
import FriendForm from "./FriendForm";
import FriendList from "./FriendList";
import { useNavigate } from "react-router-dom";
import "./Friends.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCircle } from "@fortawesome/free-solid-svg-icons";

const Friends = () => {
	const [connections, setConnections] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();
	const [hasNewRequest, setHasNewRequest] = useState(false);

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

	useEffect(() => {
		const interval = setInterval(fetchRequests, 2000);

		return () => clearInterval(interval);
	}, []);

	//toggle tabs for Friends and Requests section
	const [activeTab, setActiveTab] = useState("Friends");
	const [connDirection, setConnDirection] = useState("anyUserID");

	//for underline selection
	const [tabUnderlineStyle, setTabUnderlineStyle] = useState({});
	const [sectionUnderlineStyle, setSectionUnderlineStyle] = useState({});
	const friendRef = useRef(null);
	const requestRef = useRef(null);
	const incomingRef = useRef(null);
	const outgoingRef = useRef(null);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	// variable for userToken to check authorization
	const userToken = sessionStorage.getItem("token");

	// useEffect hook, this will run everything inside the callback
	// function once when the component loads
	// the dependency array has userToken inside of it, which means the useEffect will
	// run everything inside of it everytime the userToken variable changes
	useEffect(() => {

		// if the user is not logged in, go back to the default route, which will take them to the login page
		if (!userToken) {
			navigate("/");
		}
	}, [userToken, navigate]);

	useEffect(() => {
		const handleResize = () => {
			calculateTabUnderlineStyle();
			if (activeTab === "Requests") {
				calculateSectionUnderlineStyle();
			}
		};

		window.addEventListener("resize", handleResize);

		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, [activeTab, connDirection]);

	const loadFriends = (direction) => {
		let url = `${process.env.REACT_APP_API_PATH}/connections?${direction}=${sessionStorage.getItem("user")}`;
		
		fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
		.then((res) => res.json())
		.then(
			(result) => {
				setIsLoaded(true);
				let filteredConnections;
				if (activeTab === "Friends") {
					setConnDirection("anyUserID")

					// For the Friends tab, filter for connections with status 'Friends'
					filteredConnections = result[0].filter((conn) => conn.attributes.status === "Friends");
				} else if (activeTab === "Requests") {
					// For the Requests tab, filter based on the connDirection
					if (connDirection === "fromUserID") {
						setConnDirection("fromUserID")
						// Filter outgoing requests
						filteredConnections = result[0].filter((conn) => conn.attributes.status === "Pending");
					} else {
						setConnDirection("toUserID")

						// Filter incoming requests
						filteredConnections = result[0].filter((conn) => conn.attributes.status === "Pending");
					}
				}
				setConnections(filteredConnections);
			},
			(error) => {
				setIsLoaded(true);
				setError(error);
			}
		);
	};
	

	// Call this function to update the tab underline style
	const calculateTabUnderlineStyle = () => {
		let activeRef = activeTab === "Friends" ? friendRef : requestRef;
		updateUnderlineStyle(activeRef, setTabUnderlineStyle);
	};

	// Call this function to update the section underline style
	const calculateSectionUnderlineStyle = () => {
		let activeRef = connDirection === "toUserID" ? incomingRef : outgoingRef;
		updateUnderlineStyle(activeRef, setSectionUnderlineStyle);
	};

	const handleSectionClick = (section) => {
		setConnDirection(section === "Outgoing" ? "fromUserID" : "toUserID");
	};

	const renderSectionSelector = () => (
		<div className="tabs">
			<div
				onClick={() => handleSectionClick("Incoming")}
				className={connDirection === "toUserID" ? "active" : ""}
				ref={incomingRef}
			>
				{hasNewRequest && (
					<FontAwesomeIcon icon={faCircle} style={{ color: "#027bff", animation: "pulse 1.5s infinite" }} />
				)}
				&nbsp;{language === "en" ? "Incoming" : "Entrante"}
			</div>
			<div
				onClick={() => handleSectionClick("Outgoing")}
				className={connDirection === "fromUserID" ? "active" : ""}
				ref={outgoingRef}
			>
				{language === "en" ? "Outgoing" : "Saliente"}
			</div>
			<div className="underline" style={sectionUnderlineStyle}></div>
		</div>
	);

	const renderTabContent = () => {
		switch (activeTab) {
			case "Friends":
				return (
					<FriendList
						userid={sessionStorage.getItem("user")}
						loadFriends={() => loadFriends("anyUserID")}
						connections={connections}
						setConnections={setConnections}
						isLoaded={isLoaded}
						error={error}
					/>
				);
			case "Requests":
				return (
					<>
						{renderSectionSelector()}
						<FriendList
							userid={sessionStorage.getItem("user")}
							loadFriends={() => loadFriends(connDirection)}
							connections={connections}
							setConnections={setConnections}
							isLoaded={isLoaded}
							error={error}
							connDirection={connDirection}
						/>
					</>
				);
			default:
				return null;
		}
	};

	// ripped from Profile.jsx -by Robert
	// Updated to handle multiple sections
	const updateUnderlineStyle = (activeRef, setStyleFunction) => {
		const extraWidth = window.innerWidth <= 768 ? 10 : 15;
		if (activeRef && activeRef.current) {
			setStyleFunction({
				left: activeRef.current.offsetLeft - extraWidth / 2,
				width: activeRef.current.offsetWidth + extraWidth,
				bottom: -3,
			});
		}
	};

	useEffect(() => {
		calculateTabUnderlineStyle();
		if (activeTab === "Requests") {
			calculateSectionUnderlineStyle();
			loadFriends(connDirection);
		}
	}, [activeTab, connDirection]);

	useEffect(() => {
		// Ensure connections are reloaded every time the activeTab or connDirection changes.
		loadFriends(connDirection);
	}, [activeTab, connDirection]);

	return (
		<div className="main-content page">
			<h1 className="Friends-text explore-header">{language === "en" ? "Friends" : "Amigos"}</h1>
			<FriendForm
				userid={sessionStorage.getItem("user")}
				loadFriends={loadFriends}
				connDirection={connDirection}
				connections={connections}
			/>
			<div className="tabs">
				<div onClick={() => setActiveTab("Friends")} ref={friendRef}>
					{language === "en" ? "Friends" : "Amigos"}
				</div>
				<div onClick={() => setActiveTab("Requests")} ref={requestRef}>
					{/* Conditionally render blue circle icon */}
					{hasNewRequest && (
						<FontAwesomeIcon icon={faCircle} style={{ color: "#027bff", animation: "pulse 1.5s infinite" }} />
					)}
					&nbsp;{language === "en" ? "Requests" : "Solicitudes"}
				</div>
				<div className="underline" style={tabUnderlineStyle}></div>
			</div>
			{renderTabContent()}
		</div>
	);
};

export default Friends;
