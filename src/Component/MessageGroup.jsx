import React, { useState, useEffect } from "react";
import DefaultUserImage from "../assets/default_user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./MessageGroup.css";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const MessageGroup = ({ id, onSelect, isSelected, groupData, userId }) => {
	const [otherUserData, setOtherUserData] = useState(null);
	const [hikeData, setHikeData] = useState({});
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		if (groupData.attributes.chatters.length > 2) {
			fetchOtherUserData(groupData.attributes.creatorId);
		} else {
			const otherUserId =
				groupData.name === "hm" || groupData.name === "ch"
					? groupData.attributes.chatters[0]
					: groupData.attributes.chatters.find((id) => id !== userId);
			if (otherUserId) {
				fetchOtherUserData(otherUserId);
			}
		}
	}, [groupData, userId]);

	useEffect(() => {
		if (
			(groupData?.name === "hm" && groupData?.attributes?.originalPost) ||
			(groupData?.name === "ch" && groupData?.attributes?.originalPost)
		) {
			getHikeData(groupData.attributes.originalPost);
		}
	}, [groupData]);

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

	const handleClick = () => {
		onSelect(id);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			onSelect(id);
		}
	};

	const formatUsername = () => {
		let username = otherUserData?.attributes?.username || "";
		let hikeTitle = hikeData?.attributes?.title || "";

		if (groupData?.name === "hm" || groupData?.name === "ch") {
			username += groupData?.attributes?.chatters?.length > 2 ? `'s ${hikeTitle}` : `'s ${hikeTitle}`;
		}

		// Shorten long usernames
		if (username.length > 40) {
			username = username.substring(0, 40) + "...";
		}

		return username;
	};

	return (
		<div
			className={`message-group ${isSelected ? "selected" : ""}`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex="0" // Makes the component focusable
			role="button" // Define the role as a button for accessibility
		>
			<>
				{groupData?.attributes?.hasNewMessage[userId] && (
					<FontAwesomeIcon icon={faCircle} style={{ color: "#027bff", animation: "pulse 1.5s infinite" }} />
				)}
				&nbsp;
				<img
					src={otherUserData?.attributes?.picture || DefaultUserImage}
					alt={otherUserData?.attributes?.username + " profile picture"}
					className="message-group-image"
				/>
				<h6 className="message-group-username">{formatUsername()}</h6>
			</>
		</div>
	);
};

export default MessageGroup;