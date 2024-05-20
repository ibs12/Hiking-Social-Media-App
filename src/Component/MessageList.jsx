import React, { useRef, useEffect, useState } from "react";
import "./MessageList.css";
import DefaultUserImage from "../assets/default_user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const MessageList = ({ onBackArrowClick, groupId, groupData, userId }) => {
	const [userDataMap, setUserDataMap] = useState({});
	const [loading, setLoading] = useState(true);
	const [topBarContent, setTopBarContent] = useState("");
	const [otherUserData, setOtherUserData] = useState(null);
	const [hikeData, setHikeData] = useState({});
	const navigate = useNavigate();
	const [language, setLanguage] = useState("en");
	

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const handleBackArrowClick = () => {
		onBackArrowClick();
	};

	useEffect(() => {
		if (
			(groupData?.name === "hm" && groupData?.attributes?.originalPost) ||
			(groupData?.name === "ch" && groupData?.attributes?.originalPost)
		) {
			getHikeData(groupData.attributes.originalPost);
		}
	}, [groupData]);

	const messageEndRef = useRef(null);

	const scrollToBottom = () => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(scrollToBottom, [loading, groupData?.attributes?.chatHistory?.length]);

	useEffect(() => {
		// If the convo was deleted, then refresh the page
		if (!groupData) {
			window.location.reload();
		}

		if (groupId && groupData?.id !== groupId) {
			return;
		}
		fetchOtherUserData(groupData.attributes.creatorId);

		fetchUserDataForChatters();
	}, [groupId, groupData]);

	const fetchUserDataForChatters = async () => {
		try {
			const chattersIds = groupData?.attributes?.chatters.filter((id) => id !== userId);
			const fetchRequests = chattersIds.map((id) =>
				fetch(`${process.env.REACT_APP_API_PATH}/users/${id}`, {
					method: "get",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				})
			);
			const responses = await Promise.all(fetchRequests);
			const userDataArray = await Promise.all(responses.map((res) => res.json()));

			const userData = {};

			userDataArray.forEach((user) => {
				if (user && user.attributes) {
					const userId = user.id;

					if (!userData[userId]) {
						userData[userId] = [];
					}

					userData[userId].push(user);
				}
			});

			setUserDataMap(userData);
			setLoading(false);

			// Set the top bar content based on the group name and language
			if (groupData.name === "hm" || groupData.name === "ch") {
				if (groupData.attributes.chatters.length === 1) {
					const username = otherUserData?.attributes?.username || "";
					const hikeTitle = hikeData?.attributes?.title || "";
					const memberCount = groupData?.attributes?.chatters?.length;

					if (language === "en") {
						setTopBarContent(`${username}'s ${hikeTitle} hike (${memberCount} Member)`);
					} else if (language === "es") {
						setTopBarContent(`${hikeTitle} de ${username} (${memberCount} miembro)`);
					}
				} else {
					const username = otherUserData?.attributes?.username || "";
					const hikeTitle = hikeData?.attributes?.title || "";
					const memberCount = groupData?.attributes?.chatters?.length;

					if (language === "en") {
						setTopBarContent(`${username}'s ${hikeTitle} (${memberCount} Members)`);
					} else if (language === "es") {
						setTopBarContent(`${hikeTitle} de ${username} (${memberCount} Miembros)`);
					}
				}
			} else if (groupData.name === "dm") {
				const otherUserId = groupData?.attributes?.chatters?.find((id) => id !== userId);
				const otherUserData = userDataMap[otherUserId]?.[0]?.attributes;
				if (otherUserData) {
					if (language === "en") {
						setTopBarContent(otherUserData?.username || "");
					} else if (language === "es") {
						setTopBarContent(otherUserData?.username || "");
					}
				}
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			setLoading(false);
		}
	};

	const fetchOtherUserData = (otherUserId) => {
		fetch(`${process.env.REACT_APP_API_PATH}/users/${otherUserId}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result && result?.attributes) {
					setOtherUserData(result);
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
			});
	};

	const getHikeData = (postId) => {
		fetch(`${process.env.REACT_APP_API_PATH}/posts/${postId}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((result) => {
				setHikeData(result);
			})
			.catch((error) => {
				console.error("Error fetching hike data:", error);
			});
	};

	const handleBackKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			handleBackArrowClick();
		}
	};

	const handleUsernameClick = (userId) => {
		navigate(`/profile/${userId}`);
	};

	return (
		<div className="message-list fade-in">
			<div className="top-bar">
				<FontAwesomeIcon
					icon={faArrowLeft}
					className="back-arrow"
					onClick={handleBackArrowClick}
					tabIndex="0" // Makes the component focusable
					role="button"
					onKeyDown={handleBackKeyDown}
				/>
				<h5>{topBarContent || "Messages"}</h5>
			</div>
			{loading ? (
				<div className="loader"></div>
			) : (
				<ul>
					{groupData?.attributes?.chatHistory?.map((message, index) => (
						<li key={index} ref={messageEndRef}>
							{parseInt(message[0]) === userId ? (
								<div className="your-messages ">
									<div className="message-content">
										<p
											className="current-user-message your-messages"
											dangerouslySetInnerHTML={{ __html: message[1] }}
										></p>
									</div>
								</div>
							) : userDataMap[parseInt(message[0])] ? (
								<div className={`all-messages`}>
									<p className="other-user-username" onClick={() => handleUsernameClick(parseInt(message[0]))}>
										{userDataMap[parseInt(message[0])]?.[0]?.attributes?.username}
									</p>
									<div className="message-content">
										<img
											src={userDataMap[parseInt(message[0])]?.[0]?.attributes?.picture || DefaultUserImage}
											className="profile-picture"
											alt="Profile"
											onClick={() => handleUsernameClick(parseInt(message[0]))}
										/>
										<p className="other-user-message" dangerouslySetInnerHTML={{ __html: message[1] }}></p>
									</div>
								</div>
							) : null}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default MessageList;