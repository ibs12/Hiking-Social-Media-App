import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";
import "../Component/Profile.css";
import DefaultUserImage from "../assets/default_user.png";
import LocationIconImage from "../assets/location_icon.png";
import "../Component/OtherUserProfile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserPlus,
	faCommentDots,
	faLocationDot,
	faEnvelopeCircleCheck,
	faUserMinus,
	faBan,
	faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import UserLiked from "./UserLiked";
import UserPosts from "./UserPosts";
import UserHikes from "./UserHikes";
import LoadingModal from "./LoadingModal";
import UserPosts2 from "./UserPosts2";
import BlockUserModal from "./BlockUserModal";

const OtherUserProfile = () => {
	const [userData, setUserData] = useState(null);
	const [likedPosts, setLikedPosts] = useState([]);
	const [activeTab, setActiveTab] = useState("Liked");
	const [loading, setLoading] = useState(true);
	const [yourUserData, setYourUserData] = useState(null);
	const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false); //options menu for block user
	const [isBlockModalOpen, setIsBlockModalOpen] = useState(false); //block modal
	const [toastMessage, setToastMessage] = useState(""); //toast
	const likedRef = useRef(null);
	const postsRef = useRef(null);
	const hikesRef = useRef(null);
	const navigate = useNavigate();
	const { userId } = useParams();
	const [language, setLanguage] = useState("en");
	const [friendsCount, setFriendsCount] = useState("0");
	const [friendsData, setFriendsData] = useState(null);
	const [friendStatus, setFriendStatus] = useState("");
	const [connectionID, setConnectionID] = useState(null);
	

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		const storedTab = sessionStorage.getItem("selectedTab");
		if (storedTab) {
			setActiveTab(storedTab);
		}
	}, []);

	const handleClickTab = (tabName) => {
		sessionStorage.setItem("selectedTab", tabName);
		setActiveTab(tabName);
	};

	const handleAddFriend = () => {
		if (friendStatus === "Pending Sent" || friendStatus === "Pending Received") {
			return;
		}

		if (friendStatus === "Friends") {
			fetch(`${process.env.REACT_APP_API_PATH}/connections/${connectionID}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			})
				.then((res) => {
					if (res.ok) {
						setFriendStatus("");
					}
				})
				.catch((error) => {
					console.error("Error rejecting friend request:", error);
				});
			return;
		}
		// If there is an existing 'Pending' connection, do not create a new one
		if (friendsData.length !== 0) {
			const existingConnection = friendsData.some((conn) => {
				const conditions =
					(conn.fromUserID === Number(sessionStorage.getItem("token")) && conn.toUserID === Number(userId)) ||
					(conn.fromUserID === Number(userId) && conn.toUserID === Number(userId));
				return conditions && conn.attributes.status === "Pending";
			});

			if (existingConnection) {
				return;
			}
		}

		// Make the API call to the user controller
		fetch(process.env.REACT_APP_API_PATH + "/connections", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				toUserID: parseInt(userId),
				fromUserID: sessionStorage.getItem("user"),
				attributes: { type: "friend", status: "Pending" },
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					setFriendStatus("Pending Sent");
				},
				(error) => {}
			);
	};

	useEffect(() => {
		fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/connections?anyUserID=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				// Filter the data to get only the connections where status is "Friends"
				const filteredConnections = data[0].filter((connection) => connection.attributes.status === "Friends");
				// Filter the data to get only the connections where status is "Pending"
				const pendingConnectionReceived = data[0].find((connection) => {
					return (
						connection.attributes.status === "Pending" &&
						connection.fromUserID === parseInt(userId) &&
						connection.toUserID === parseInt(sessionStorage.getItem("user"))
					);
				});

				const pendingConnectionSent = data[0].find((connection) => {
					return (
						connection.attributes.status === "Pending" &&
						connection.fromUserID === parseInt(sessionStorage.getItem("user")) &&
						connection.toUserID === parseInt(userId)
					);
				});

				const friendConnection = data[0].find((connection) => {
					return (
						connection.attributes.status === "Friends" &&
						((connection.fromUserID === parseInt(userId) &&
							connection.toUserID === parseInt(sessionStorage.getItem("user"))) ||
							(connection.fromUserID === parseInt(sessionStorage.getItem("user")) &&
								connection.toUserID === parseInt(userId)))
					);
				});

				// Set friend status to "Pending" if there's a pending connection, otherwise set it to "Friends"
				if (pendingConnectionSent) {
					setFriendStatus("Pending Sent");
				} else if (pendingConnectionReceived) {
					setFriendStatus("Pending Received");
				}
				if (friendConnection) {
					setFriendStatus("Friends");
					setConnectionID(friendConnection.id);
				}

				setFriendsCount(filteredConnections.length);
				setFriendsData(filteredConnections);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}, [userId, friendStatus]);

	const showToast = (message) => {
		setToastMessage(message);
		const toastElement = document.getElementById("blockToast");
		if (toastElement) {
			toastElement.classList.add("block-toast-visible");
			setTimeout(() => {
				toastElement.classList.remove("block-toast-visible");
				navigate("/gallery");
			}, 3000);
		}
	};

	// visibility of the options menu
	const toggleOptionsMenu = () => {
		setIsOptionsMenuVisible(!isOptionsMenuVisible);
	};

	const openBlockUserModal = () => {
		setIsOptionsMenuVisible(false);
		setIsBlockModalOpen(true);
	};

	const closeBlockUserModal = () => {
		setIsBlockModalOpen(false);
	};

	const onBlockUserClicked = () => {
		console.log("Block user was clicked!");

		openBlockUserModal();
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

	// Get their data
	useEffect(() => {
		fetchYourUserData();
		const fetchOtherUserData = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch user data");
				}

				const userData = await response.json();
				setUserData(userData);
				setLikedPosts(JSON.parse(userData?.attributes?.likedPosts || "[]"));
				setLoading(false);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchOtherUserData();
	}, [userId]);

	const getUnderlineStyle = () => {
		let activeRef;

		if (activeTab === "Liked") activeRef = likedRef;
		else if (activeTab === "Posts") activeRef = postsRef;
		else if (activeTab === "Hikes") activeRef = hikesRef;

		const isMobile = window.innerWidth <= 768;

		const extraWidth = isMobile ? 10 : 15;
		const shiftLeftAmount = isMobile ? 20 : 50;

		if (activeRef && activeRef.current) {
			return {
				left: activeRef.current.offsetLeft - shiftLeftAmount - extraWidth / 2,
				width: activeRef.current.offsetWidth + extraWidth,
				bottom: -3,
			};
		} else {
			return {};
		}
	};

	const handleDirectMessageClick = async () => {
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

	if (loading) {
		return <LoadingModal />;
	}

	return (
		<div className="settings fade-in">
			<img
				src={userData?.attributes?.picture || DefaultUserImage}
				alt={userData?.attributes?.username + " profile picture"}
				className="profilePic"
			/>
			<span className="profile-options">
				<button onClick={toggleOptionsMenu} className="options-menu-button">
					<FontAwesomeIcon icon={faEllipsis} size="lg" />
				</button>
				{isOptionsMenuVisible && (
					<div className="options-menu">
						<button onClick={onBlockUserClicked} className="block-button">
							<FontAwesomeIcon icon={faBan} size="xl" /> {language === "en" ? "Block User" : "Bloquear"}
						</button>
					</div>
				)}
			</span>
			<div className="usernameText">{userData?.attributes?.username || "null"}</div>
			<div className="locationText">
				<FontAwesomeIcon icon={faLocationDot} />
				&nbsp;{userData?.attributes?.city || "Somewhere"}
			</div>
			<div className="friendsText">
				{friendsCount} {language === "en" ? "Friend(s)" : "Amigo(s)"}
			</div>
			<div className="buttonsArea">
				<button
					className={`friendButton ${
						friendStatus === "Friends"
							? "redButton"
							: friendStatus === "Pending Sent" || friendStatus === "Pending Received"
							? "grayButton"
							: ""
					}`}
					onClick={handleAddFriend}
				>
					{friendStatus === "" ? (
						<FontAwesomeIcon icon={faUserPlus} />
					) : friendStatus === "Pending Sent" || friendStatus === "Pending Received" ? (
						<FontAwesomeIcon icon={faEnvelopeCircleCheck}></FontAwesomeIcon>
					) : (
						<FontAwesomeIcon icon={faUserMinus} />
					)}
					&nbsp;
					{friendStatus === ""
						? language === "en"
							? "Add Friend"
							: "Agregar Amigo"
						: friendStatus === "Pending Sent"
						? language === "en"
							? "Request Sent"
							: "Solicitud Enviada"
						: friendStatus === "Pending Received"
						? language === "en"
							? "Request Received"
							: "Solicitud Recibida"
						: language === "en"
						? "Unfriend"
						: "Eliminar Amigo"}
				</button>

				<button className="editProfileButton" onClick={handleDirectMessageClick}>
					<FontAwesomeIcon icon={faCommentDots} />
					&nbsp;{language === "en" ? "Direct Message" : "Mensaje Directo"}
				</button>
			</div>

			<div className="LikedPostsHikesArea">
				<div
					ref={likedRef}
					className="LikedText"
					onClick={() => handleClickTab("Liked")}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							handleClickTab("Liked");
						}
					}}
				>
					{language === "en" ? "Liked" : "Gustado"}
				</div>

				<div
					ref={postsRef}
					className="PostsText"
					onClick={() => handleClickTab("Posts")}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							handleClickTab("Posts");
						}
					}}
				>
					{language === "en" ? "Posts" : "Publicaciones"}
				</div>

				<div
					className="HikesText"
					ref={hikesRef}
					onClick={() => handleClickTab("Hikes")}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							handleClickTab("Hikes");
						}
					}}
				>
					{language === "en" ? "Hikes" : "Excursiones"}
				</div>
				<div className="underline" style={getUnderlineStyle()}></div>
			</div>

			{activeTab === "Liked" ? (
				<div>
					<UserLiked likedPosts={likedPosts}></UserLiked>
				</div>
			) : activeTab === "Posts" ? (
				<div>
					<UserPosts2 userId={userId}></UserPosts2>
				</div>
			) : activeTab === "Hikes" ? (
				<div>
					<UserHikes userId={userId} username={userData?.attributes?.username || "null"}></UserHikes>
				</div>
			) : null}
			<BlockUserModal
				isOpen={isBlockModalOpen}
				onClose={() => closeBlockUserModal()}
				userData={userData}
				onBlockSuccess={() => {
					showToast(
						language === "en"
							? `User ${userData?.attributes?.username} successfully blocked!`
							: `¡Usuario ${userData?.attributes?.username} bloqueado exitosamente!`
					);
					closeBlockUserModal();
				}}
				onBlockFailure={() => {
					showToast(language === "en" ? "Failed to block user." : "Error al bloquear al usuario.");
				}}
			/>
			<div id="blockToast" className="block-toast">
				{toastMessage}
			</div>
		</div>
	);
};

export default OtherUserProfile;
