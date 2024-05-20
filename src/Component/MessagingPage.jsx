import React, { useState, useEffect } from "react";
import "./MessagingPage.css";
import MessageGroup from "./MessageGroup";
import MessageList from "./MessageList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const MessagingPage = () => {
	const [userData, setUserData] = useState(null);
	const [groups, setGroups] = useState([]);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [fullScreen, setFullScreen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [messageContent, setMessageContent] = useState("");
	const navigate = useNavigate();
	const [language, setLanguage] = useState("en");
	const [blockedUsers, setBlockedUsers] = useState([]);


	useEffect(() => {
		fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/connections?anyUserID=${userData?.id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data[0]);
				// Filter the data to get only the connections where status is "Friends"
				const filteredConnections = data[0].filter((connection) => connection.attributes.status === "Blocked");

				const userIds = filteredConnections.flatMap((connection) => [connection.fromUserID, connection.toUserID]);
				
				const otherUserIds = userIds.filter((id) => id !== userData.id);		

				setBlockedUsers(otherUserIds)

				
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}, [userData?.id]);

	const userToken = sessionStorage.getItem("token");
	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	// if the user isn't logged in, send them to homepage to log in
	useEffect(() => {
		if (!userToken) {
			navigate("/");
		}
	}, [userToken]);

	useEffect(() => {
		// Function to handle actions on mount, unmount, and selectedGroup change
		const handleSetup = () => {
			// Scroll to the top of the page
			window.scrollTo(0, 0);
			// Disable body scroll
			document.body.style.overflow = "hidden";
		};

		// Setup on mount/selectedGroup change
		handleSetup();

		// Setup resize listener to re-apply setup on window resize
		const handleResize = () => {
			handleSetup(); // Call handleSetup to re-apply necessary actions
		};

		// Add event listener for window resize
		window.addEventListener("resize", handleResize);

		// Cleanup function to re-enable body scroll and remove resize listener
		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("resize", handleResize);
		};
	}, [selectedGroup]);

	useEffect(() => {
		fetchUserData();
	}, []);

	useEffect(() => {
		if (userData) {
			const intervalId = setInterval(fetchGroups, 1000);
			return () => clearInterval(intervalId);
		}
	}, [userData, blockedUsers]);

	const fetchUserData = async () => {
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
			const userData = await response.json();
			setUserData(userData);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching user data:", error);
			setLoading(false);
		}
	};

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
	
			// Get the IDs of blocked users
	
			const filteredGroups = data[0].filter(
				(group) =>
					(group.name === "dm" || group.name === "hm" || group.name === "ch") &&
					group.attributes.chatters.includes(userData.id) &&
					!blockedUsers.some((blockedUserId) => group.attributes.chatters.includes(blockedUserId))
			);
			setGroups(filteredGroups);
		} catch (error) {
			console.error("Error fetching groups:", error);
			navigate(`/messages`);
		}
	};

	const handleGroupSelect = async (groupId) => {
		if (selectedGroup === groupId) {
			// If the clicked group is already selected, deselect it
			setSelectedGroup(null);
		} else {
			// Deselect the current group and select the desired group
			setSelectedGroup(null);
			setFullScreen(false);
			setSelectedGroup(groupId);
			setFullScreen(true);

			const selectedGroupData = groups.find((group) => group.id === groupId);

			if (selectedGroupData) {
				const updatedHasNewMessage = { ...selectedGroupData.attributes.hasNewMessage, [userData.id]: false };
				const updatedAttributes = { ...selectedGroupData.attributes, hasNewMessage: updatedHasNewMessage };
				const updatedGroupData = { ...selectedGroupData, attributes: updatedAttributes };

				try {
					const response = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${groupId}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
						body: JSON.stringify(updatedGroupData),
					});

					if (!response.ok) {
						throw new Error("Failed to update group data");
					}

					// Update the groups state with the updated group data
					const updatedGroups = groups.map((group) => (group.id === groupId ? updatedGroupData : group));
					setGroups(updatedGroups);
				} catch (error) {
					console.error("Error updating group data:", error);
				}
			}
		}
	};

	const handleBackArrowClick = async () => {
		// Set hasNewMessage to false for the current user
		const selectedGroupData = groups.find((group) => group.id === selectedGroup);
		if (selectedGroupData) {
			const updatedHasNewMessage = { ...selectedGroupData.attributes.hasNewMessage };
			updatedHasNewMessage[userData.id] = false;

			const updatedGroupData = {
				...selectedGroupData,
				attributes: {
					...selectedGroupData.attributes,
					hasNewMessage: updatedHasNewMessage,
				},
			};

			try {
				const response = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${selectedGroup}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify(updatedGroupData),
				});

				if (!response.ok) {
					throw new Error("Failed to update group data");
				}

				const updatedGroups = groups.map((group) => {
					if (group.id === selectedGroup) {
						return updatedGroupData;
					}
					return group;
				});
				setGroups(updatedGroups);
				setSelectedGroup(null);
				setFullScreen(false);
			} catch (error) {
				console.error("Error updating group data:", error);
			}
		}
	};

	const escapeHtml = (unsafe) => {
		return unsafe.replace(/[<>&'"{}/=!:;()\[\]]/g, (match) => {
			switch (match) {
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case "&":
					return "&amp;";
				case "'":
					return "&apos;";
				case '"':
					return "&quot;";
				case "{":
					return "&#123;";
				case "}":
					return "&#125;";
				case "!":
					return "&#33;";
				case "=":
					return "&#61;";
				case ":":
					return "&#58;";
				case ";":
					return "&#59;";
				case "(":
					return "&#40;";
				case ")":
					return "&#41;";
				case "[":
					return "&#91;";
				case "]":
					return "&#93;";
				default:
					return match;
			}
		});
	};

	const handleMessageSend = async () => {
		if (!messageContent) return;

		try {
			const escapedMessageContent = escapeHtml(messageContent);

			const newMessage = [userData.id, escapedMessageContent];
			const selectedGroupData = groups.find((group) => group.id === selectedGroup);
			const updatedGroupData = {
				...selectedGroupData,
				attributes: {
					...selectedGroupData.attributes,
					chatHistory: [...selectedGroupData.attributes.chatHistory, newMessage],
				},
			};

			// Set hasNewMessage to true for all other users except the current user
			const updatedHasNewMessage = {};
			selectedGroupData.attributes.chatters.forEach((userId) => {
				updatedHasNewMessage[userId] = userId !== userData.id;
			});

			updatedGroupData.attributes.hasNewMessage = updatedHasNewMessage;

			const response = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${selectedGroup}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify(updatedGroupData),
			});

			if (!response.ok) {
				throw new Error("Failed to update group data");
			}

			const updatedGroups = groups.map((group) => {
				if (group.id === selectedGroup) {
					return updatedGroupData;
				}
				return group;
			});
			setGroups(updatedGroups);
			setMessageContent("");
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	useEffect(() => {
		return () => {
			if (selectedGroup) {
				updateHasNewMessage(selectedGroup, userData.id, false);
			}
		};
	}, [selectedGroup, userData]);

	const updateHasNewMessage = async (groupId, userId, value) => {
		try {
			const response = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${groupId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch group data");
			}

			const groupData = await response.json();

			// Update hasNewMessage for the current user
			const updatedHasNewMessage = { ...groupData.attributes.hasNewMessage };
			updatedHasNewMessage[userId] = value;

			// Update the group data with the new hasNewMessage status
			const updatedGroupData = {
				...groupData,
				attributes: {
					...groupData.attributes,
					hasNewMessage: updatedHasNewMessage,
				},
			};

			// Patch the updated group data
			const patchResponse = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${groupId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify(updatedGroupData),
			});

			if (!patchResponse.ok) {
				throw new Error("Failed to update group data");
			}

			// Update the groups state with the patched data
			const updatedGroups = groups.map((group) => {
				if (group.id === groupId) {
					return updatedGroupData;
				}
				return group;
			});
			setGroups(updatedGroups);
		} catch (error) {
			console.error("Error updating group data:", error);
		}
	};

	const handleSendKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			handleMessageSend();
		}
	};

	return (
		<div className="messaging-page fade-in">
			{loading ? (
				<div className="loader"></div>
			) : (
				<>
					<div className={`left-column flex-1  scrollable-class ${selectedGroup ? "hidden" : ""}`}>
						<h1 className="explore-header messages-header">{language === "en" ? "Messages" : "Mensajes"}</h1>

						<h5 className="left-column-heading">{language === "en" ? "Direct Messages" : "Mensajes Directos"}</h5>
						{groups
							.filter((group) => group.name === "dm")
							.map((group) => (
								<MessageGroup
									key={group.id}
									id={group.id}
									onSelect={handleGroupSelect}
									isSelected={selectedGroup === group.id}
									groupData={group}
									userId={userData.id}
								/>
							))}
						<h5 className="left-column-heading">{language === "en" ? "Current Hikes" : "Excursiones Actuales"}</h5>
						{groups
							.filter((group) => group.name === "hm")
							.map((group) => (
								<MessageGroup
									key={group.id}
									id={group.id}
									onSelect={handleGroupSelect}
									isSelected={selectedGroup === group.id}
									groupData={group}
									userId={userData.id}
								/>
							))}
						<h5 className="left-column-heading">{language === "en" ? "Completed Hikes" : "Excursiones Completadas"}</h5>
						{groups
							.filter((group) => group.name === "ch")
							.map((group) => (
								<MessageGroup
									key={group.id}
									id={group.id}
									onSelect={handleGroupSelect}
									isSelected={selectedGroup === group.id}
									groupData={group}
									userId={userData.id}
								/>
							))}
					</div>
					<div className={`right-column  scrollable-class ${selectedGroup ? "flex-1" : "hidden"}`}>
						{selectedGroup && (
							<MessageList
								groupId={selectedGroup}
								groupData={groups.find((group) => group.id === selectedGroup)}
								onBackArrowClick={handleBackArrowClick}
								userId={userData.id}
							/>
						)}
						{selectedGroup && (
							<div className="message-input-container">
								<input
									type="text"
									placeholder={language === "en" ? "Send a message" : "Envíe un mensaje"}
									className="message-input"
									value={messageContent}
									onChange={(e) => setMessageContent(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleMessageSend();
										}
									}}
								/>
								<FontAwesomeIcon
									icon={faPaperPlane}
									className="send-icon"
									onClick={handleMessageSend}
									tabIndex="0" // Makes the component focusable
									role="button"
									onKeyDown={handleSendKeyDown}
								/>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default MessagingPage;
