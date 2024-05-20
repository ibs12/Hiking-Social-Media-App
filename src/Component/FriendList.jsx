import React, { useState, useEffect } from "react";
// import blockIcon from "../assets/block_white_216x216.png";
// import unblockIcon from "../assets/thumbsup.png";
// import messageIcon from "../assets/comment.svg";
import DefaultUserImage from "../assets/default_user.png";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPaperPlane,
	faBan,
	faThumbsUp,
	faEllipsis,
	faCheck,
	faXmark,
	faCommentDots,
	faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import "./FriendList.css";

const FriendList = (props) => {
	const [optionsExpanded, setOptionsExpanded] = useState({});
	const [yourUserData, setYourUserData] = useState(null);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const navigate = useNavigate();

	const [toastMessage, setToastMessage] = useState("");
	const showToast = (message) => {
		setToastMessage(message);
		const toastElement = document.getElementById("friendsToast");
		if (toastElement && toastMessage !== "") {
			toastElement.classList.add("friends-toast-visible");
			// auto hide the toast after 3 secs
			setTimeout(() => {
				toastElement.classList.remove("friends-toast-visible");
			}, 3000);
		}
	};

	// Get your data
	const fetchYourUserData = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch user data");
			}
			const yourData = await response.json();
			setYourUserData(yourData);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	useEffect(() => {
		fetchYourUserData();
		props.loadFriends();
	}, [props.connDirection]);

	// useEffect(() => {
	//   props.loadFriends();
	// }, []); // Empty dependency array ensures this effect runs once after the initial render

	const updateConnection = (id, status) => {
		if (id === sessionStorage.getItem("user")) props.loadFriends();

		//make the api call to the user controller with a PATCH request for updating a connection with another user
		fetch(process.env.REACT_APP_API_PATH + "/connections/" + id, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
			body: JSON.stringify({
				attributes: { status: status, type: "friend" },
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					showToast("Connection ", id, " updated to ", status);
					props.setConnections([]);
					props.loadFriends();
				},
				(error) => {
					showToast("error!");
				}
			);
	};

	const acceptFriendRequest = (id) => {
		fetch(`${process.env.REACT_APP_API_PATH}/connections/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				attributes: { status: "Friends" },
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					showToast(language === "en" ? "Friend request accepted!" : "¡Solicitud de amistad aceptada!");
					props.loadFriends(); // Reload the friend list to reflect the changes
				},
				(error) => {
					showToast(language === "en" ? "Error!" : "¡Error!");
					console.error("Error accepting friend request:", error);
				}
			);
	};

	const rejectFriendRequest = (id, status) => {
		fetch(`${process.env.REACT_APP_API_PATH}/connections/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => {
				if (res.ok) {
					if (status === "reject") {
						showToast(language === "en" ? "Friend request rejected!" : "¡Solicitud de amistad rechazada!");
					} else if (status === "cancel") {
						showToast(language === "en" ? "Friend request cancelled!" : "¡Solicitud de amistad cancelada!");
					} else {
						showToast(language === "en" ? "Unfriended successfully!" : "¡Eliminado de este amigos con éxito!");
					}
					props.loadFriends(); // Reload to reflect changes
				} else {
					showToast(
						language === "en" ? "Failed to reject friend request" : "Error al rechazar la solicitud de amistad"
					);
				}
			})
			.catch((error) => {
				showToast(language === "en" ? "Error!" : "¡Error!");

				console.error("Error rejecting friend request:", error);
			});
	};

	const unfriend = (id) => {
		fetch(`${process.env.REACT_APP_API_PATH}/connections/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				attributes: { status: "Unfriended" },
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					showToast(language === "en" ? "Friend successfully unfriended:" : "Amigo eliminado con éxito:", result);
					props.loadFriends();
				},
				(error) => {
					showToast(language === "en" ? "Error unfriending user:" : "Error al eliminar amigo:", error);
				}
			);
	};

	// If the user is not blocked, show the block icon
	// Otherwise, show the unblock icon and update the connection
	// with the updateConnection function
	const conditionalAction = (connection) => {
		if (connection.attributes.status === "Friends") {
			return (
				<button className="button-icon" onClick={() => rejectFriendRequest(connection.id, "unfriend")}>
					<FontAwesomeIcon icon={faUserMinus} size="lg" /> {language === "en" ? "Unfriend" : "Eliminar amigo"}
				</button>
			);
		} else if (connection.attributes.status === "Pending" && props.connDirection === "toUserID") {
			return (
				<>
					<button className="button-accept-request" onClick={() => acceptFriendRequest(connection.id)}>
						<FontAwesomeIcon icon={faCheck} size="lg" /> {language === "en" ? "Accept" : "Aceptar"}
					</button>
					{/* reject friend requests deleted connection */}
					<button className="button-reject-request" onClick={() => rejectFriendRequest(connection.id, "reject")}>
						<FontAwesomeIcon icon={faXmark} size="lg" /> {language === "en" ? "Reject" : "Rechazar"}
					</button>
				</>
			);
		} else if (connection.attributes.status === "Pending") {
			// cancel request should delete the connection
			return (
				<button className="button-cancel-request" onClick={() => rejectFriendRequest(connection.id, "cancel")}>
					<FontAwesomeIcon icon={faXmark} size="lg" /> {language === "en" ? "Cancel Request" : "Cancelar Solicitud"}
				</button>
			);
		} else {
			return (
				<button className="button-icon" onClick={() => updateConnection(connection.id, "Friends")}>
					<FontAwesomeIcon icon={faThumbsUp} size="lg" /> {language === "en" ? "Unblock User" : "Desbloquear Usuario"}
				</button>
			);
		}
	};

	const handleDirectMessageClick = async (userId) => {
		try {
			// Check if a group already exists between the current user and the other user
			const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch groups");
			}

			const groups = await response.json();

			const existingGroup = groups[0].find(
				(group) =>
					group.name === "dm" &&
					group.attributes.chatters.includes(yourUserData.id) &&
					group.attributes.chatters.includes(parseInt(userId))
			);

			// There is a a group with these two users, so don't post a new group, but send them to the messages page
			if (existingGroup) {
				navigate(`/messages`);
			} else {
				const newGroup = {
					name: "dm",
					attributes: {
						creatorId: yourUserData.id,
						chatters: [yourUserData.id, parseInt(userId)],
						chatHistory: [],
						hasNewMessage: {},
					},
				};

				newGroup.attributes.hasNewMessage[yourUserData.id] = false;
				newGroup.attributes.hasNewMessage[userId] = false;

				const createResponse = await fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify(newGroup),
				});

				if (!createResponse.ok) {
					throw new Error("Failed to create group");
				}

				const createdGroup = await createResponse.json();
				navigate(`/messages`);
			}
		} catch (error) {
			console.error("Error handling direct message:", error);
		}
	};

	const toggleOptions = (id) => {
		setOptionsExpanded((prevOptions) => ({
			...prevOptions,
			[id]: !prevOptions[id],
		}));
	};

	if (props.error) {
		return <div> {language === "en" ? `Error: ${props.error.message}` : `Error: ${props.error.message}`} </div>;
	} else if (!props.isLoaded) {
		return <div> {language === "en" ? "Loading..." : "Cargando..."} </div>;
	} else {
		return (
			<div>
				<ul className="friend-list">
					{props.connections
						.reverse() // Reverse the order to show the newest at the top
						.map((connection) => {
							// Determine if the logged-in user is the 'toUser' for this connection
							const loggedInUserId = parseInt(sessionStorage.getItem("user"));
							const isToUser = connection.toUserID === loggedInUserId;

							// Select the correct user to display based on the direction of the connection
							const displayUser = isToUser ? connection.fromUser : connection.toUser;

							return (
								<div key={connection.id} className="friend-tile">
									{/* options - block user */}

									<div className="friend-profile">
										<img
											src={displayUser.attributes.picture || DefaultUserImage}
											alt={displayUser.attributes.username}
										/>
									</div>

									<div>
										<Link className="username-text" to={`/profile/${displayUser.id}`}>
											{displayUser.attributes.username}
										</Link>

										<p className={`friend-status-${connection.attributes.status}`}>
											{connection.attributes.status === "Pending"
												? language === "en"
													? "Pending"
													: "Pendiente"
												: connection.attributes.status === "Friends"
												? ""
												: ""}
										</p>
									</div>
									<button
										className="button-icon-msg black"
										onClick={() => handleDirectMessageClick(connection.toUserID)}
									>
										<FontAwesomeIcon icon={faCommentDots} /> {language === "en" ? "Message" : "Mesajear"}
									</button>
									<br />
									{conditionalAction(connection)}
								</div>
							);
						})}
				</ul>
				{toastMessage !== "" ? (
					<div id="friendsToast" className="friends-toast">
						{toastMessage}
					</div>
				) : null}
			</div>
		);
	}
};

export default FriendList;
