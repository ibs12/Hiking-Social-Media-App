import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BlockUserModal = ({ isOpen, onClose, userData, onBlockSuccess, onBlockFailure }) => {
	const [language, setLanguage] = useState("en");
	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	if (!isOpen) return null;
	const username = userData?.attributes?.username || "";
	const apiUrl = process.env.REACT_APP_API_PATH;
	const token = sessionStorage.getItem("token");
	const fromUserID = sessionStorage.getItem("user");

	const handleYesClick = async () => {
		const checkAndUpdateConnection = async (fromID, toID) => {
			try {
				const res = await fetch(`${apiUrl}/connections?fromUserID=${fromID}&toUserID=${toID}`, {
					headers: {
						Authorization: "Bearer " + token,
					},
				});
				const data = await res.json();
				if (Array.isArray(data[0]) && data[0].length > 0) {
					const connectionId = data[0][0].id;
					await fetch(`${apiUrl}/connections/${connectionId}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + token,
						},
						body: JSON.stringify({
							attributes: { type: "friend", status: "Blocked" },
						}),
					});
				} else {
					await fetch(`${apiUrl}/connections`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + token,
						},
						body: JSON.stringify({
							toUserID: toID,
							fromUserID: fromID,
							attributes: { type: "friend", status: "Blocked" },
						}),
					});
				}
			} catch (error) {
				onBlockFailure();
				console.error("Error:", error);
			}
		};

		await checkAndUpdateConnection(fromUserID, userData.id);
		await checkAndUpdateConnection(userData.id, fromUserID);
		onBlockSuccess();

		onClose();
	};

	return (
		<div className="modalOverlay">
			<div className="modalContent">
				<button className="closeButton" onClick={onClose}>
					X
				</button>
				<h3>{language === "en" ? `Block ${username}?` : `¿Bloquear ${username}?`}</h3>
				<p className="dialogueText">
					{language === "en"
						? "Are you sure you want to block this user?"
						: "¿Estás seguro de que quieres bloquear a este usuario?"}
				</p>{" "}
				<div className="buttonsArea">
					<button className="noButton" onClick={onClose}>
						No
					</button>
					<button className="yesButton" onClick={handleYesClick}>
						{language === "en" ? "Yes" : "Sí"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BlockUserModal;
