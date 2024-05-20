import React, { useState, useEffect } from "react";
import "../Component/DeleteProfileModal.css";
import UserIconTextboxImage from "../assets/user_icon_textbox.png";
import "../Component/Textbox.css";
import { useNavigate } from "react-router-dom";

const userId = sessionStorage.getItem("user");

const DeleteProfileModal = ({
	isOpen,
	onClose,
	onConfirm,
	errorMessage,
	setErrorMessage,
	inputUsername,
	setInputUsername,
	actualUsername,
}) => {
	const [isConfirming, setIsConfirming] = useState(false);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	const handleYesClick = () => {
		setIsConfirming(true);
	};

	const navigate = useNavigate();
	const handleConfirm = async () => {
		if (inputUsername === actualUsername) {
			try {
				// Fetch all groups initially to get their IDs
				const groupsResponse = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				});

				if (!groupsResponse.ok) {
					throw new Error("Failed to fetch groups");
				}

				const groupsDataResponse = await groupsResponse.json();
				const groupsData = groupsDataResponse[0]; // Assuming the first element is the actual array of groups

				const detailedGroups = [];

				// Fetch details for each group to get creatorId
				for (const group of groupsData) {
					const detailResponse = await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${group.id}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
					});

					if (detailResponse.ok) {
						const groupDetails = await detailResponse.json();
						detailedGroups.push(groupDetails);
						// Log each group's details
						console.log(`Details for group ID ${group.id}:`, groupDetails);
					} else {
						console.error("Failed to fetch group details for ID:", group.id);
					}
				}

				// Filter groups owned by the user (where creatorId matches userId)
				const ownedGroups = detailedGroups.filter((group) => group.attributes && group.attributes.creatorId == userId);

				// Log the owned groups to see what they contain
				console.log("Owned Groups:", ownedGroups);

				//	Delete all groups owned by the user
				for (const group of ownedGroups) {
					await fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/groups/${group.id}`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
					});
				}
				setIsConfirming(false);

				//Proceed to delete user profile if all group deletions were successful
				const deleteResponse = await fetch(
					`${process.env.REACT_APP_API_PATH}/users/${userId}?relatedObjectsAction=delete`,
					{
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
					}
				);

				if (deleteResponse.ok) {
					sessionStorage.clear();
					setShowSuccessModal(true); // Show success message
				} else {
					const text = await deleteResponse.text();
					setErrorMessage(text || "Failed to delete profile. Incorrect password or server error.");
				}
			} catch (error) {
				console.error("Error during deletion process:", error);
				setErrorMessage("An error occurred during the deletion process.");
			}
		} else {
			setErrorMessage(language === "en" ? "Incorrect username entered." : "Nombre de usuario incorrecto ingresado.");
		}
	};

	const handleClose = () => {
		if (showSuccessModal) {
			navigate("/register");
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="modalOverlay">
			<div className="modalContent">
				<button className="closeButton" onClick={handleClose}>
					X
				</button>
				{!isConfirming && !showSuccessModal ? (
					<>
						<h3>{language === "en" ? "Delete your profile?" : "¿Borrar tu perfil?"}</h3>
						<p className="dialogueText">
							{language === "en"
								? "Are you sure you want to continue? This action cannot be undone."
								: "¿Estás seguro de que quieres continuar? Esta acción no se puede deshacer."}
						</p>

						<div className="buttonsArea">
							<button className="noButton" onClick={handleClose}>
								{language === "en" ? "No" : "No"}
							</button>
							<button className="yesButton" onClick={() => setIsConfirming(true)}>
								{language === "en" ? "Yes" : "Sí"}
							</button>
						</div>
					</>
				) : showSuccessModal ? (
					<>
						<h3>{language === "en" ? "Account Deleted Successfully" : "Cuenta Eliminada Exitosamente"}</h3>{" "}
						<p className="dialogueText">
							{language === "en"
								? "Your profile has been successfully deleted."
								: "Tu perfil ha sido eliminado exitosamente."}
						</p>{" "}
						<div className="buttonsArea">
							<button className="noButton" onClick={handleClose}>
								OK
							</button>
						</div>
					</>
				) : (
					<>
						<h3>{language === "en" ? "Confirm Deletion" : "Confirmar Borración"}</h3>
						<p className="dialogueText">
							{language === "en"
								? "Please enter your username to confirm deletion:"
								: "Por favor, ingresa tu nombre de usuario para confirmar el borrado:"}
						</p>
						<label className="textboxLabel">
							{language === "en" ? "Username" : "Nombre de usuario"}
							<br />
						</label>

						<div className="inputWithIcon">
							<img src={UserIconTextboxImage} alt="Username Icon" className="inputIcon" />
							<input
								type="text"
								value={inputUsername}
								onChange={(e) => setInputUsername(e.target.value)}
								className="textbox"
								placeholder={language === "en" ? "Username" : "Nombre de usuario"}
							/>
						</div>

						<p className="errorMessageText">{errorMessage}</p>

						<div className="buttonsArea">
							<button className="noButton" onClick={() => setIsConfirming(false)}>
								{language === "en" ? "Back to Safety" : "Volver a la seguridad"}
							</button>
							<button className="yesButton" onClick={handleConfirm}>
								{language === "en" ? "Delete Profile" : "Borrar Perfil"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
export default DeleteProfileModal;
