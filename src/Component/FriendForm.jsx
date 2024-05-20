import React, { useState, useEffect } from "react";
import Autocomplete from "./Autocomplete.jsx";
import "./FriendForm.css";

const FriendForm = ({ userid, loadFriends, connDirection, connections }) => {
	const [friendname, setFriendname] = useState("");
	const [friendid, setFriendid] = useState("");
	const [users, setUsers] = useState([]);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const [responseMessage, setResponseMessage] = useState("");
	const showToast = (message) => {
		setResponseMessage(message);
		const toastElement = document.getElementById("responseToast");
		if (toastElement && responseMessage !== "") {
			toastElement.classList.add("frnds-toast-visible");
			// auto hide the toast after 3 secs

			setTimeout(() => {
				toastElement.classList.remove("frnds-toast-visible");
			}, 3000);
		}
	};

	useEffect(() => {
		// Fetch data and update users state
		// make the api call to the user API to get the user with all of their attached preferences
		fetch(process.env.REACT_APP_API_PATH + "/users/", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
		})
			.then((res) => res.json())
			.then(
				(result) => {
					if (result) {
						let names = [];
						result[0].forEach((element) => {
							if (element.attributes && element.attributes.username) {
								names.push(element);
							}
						});
						setUsers(names);
						showToast(result.Status);
					}
				},
				(error) => {
				}
			);
	}, []); // Empty dependency array ensures this effect runs once after the initial render

	// Set the friendid state to the user id that is selected from the autocomplete for the connection
	const selectAutocomplete = (friendID) => {
		setFriendid(friendID);
	};

	const submitHandler = (event) => {
		event.preventDefault();
		

		// If there is an existing 'Pending' connection, do not create a new one
		if (connections.length !== 0) {

			const existingConnection = connections.some((conn) => {
				const conditions =
					(conn.fromUserID === Number(userid) && conn.toUserID === Number(friendid)) ||
					(conn.fromUserID === Number(friendid) && conn.toUserID === Number(userid));
				return conditions && conn.attributes.status === "Pending";
			});


			if (existingConnection) {
				{language === "en" ? showToast("Request already sent.") : showToast("La solicitud ya ha sido enviada.")}
				return;
			}
		}

		if (friendid === userid) {
			{language === "en" ? showToast("Can't send request to self!") : showToast("No se puede enviar la solicitud a uno mismo.")}
			return;
		}

		// Make the API call to the user controller
		fetch(process.env.REACT_APP_API_PATH + "/connections", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
			body: JSON.stringify({
				toUserID: friendid,
				fromUserID: sessionStorage.getItem("user"),
				attributes: { type: "friend", status: "Pending" },
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					{language === "en" ? showToast("Friend Request Sent!") : showToast("¡Solicitud de amistad enviada!")}
					loadFriends(connDirection);
				},
				(error) => {
				}
			);
	};

	return (
		<form onSubmit={submitHandler} className="friend-search">
			<label>
				<div className="autocomplete-wrapper">
					<Autocomplete suggestions={users} selectAutocomplete={selectAutocomplete} />
				</div>
			</label>
			{responseMessage !== "" ? (
				<div id="responseToast" className="frnds-toast">
					{responseMessage}
				</div>
			) : null}
		</form>
	);
};

export default FriendForm;
