import React, { useState, useEffect } from "react";
import "../Component/EditProfileModal.css";
import UserIconTextboxImage from "../assets/user_icon_textbox.png";
import "../Component/Textbox.css";
import LocationIconImage from "../assets/location_icon.png";
import DefaultUserImage from "../assets/default_user.png";
import PencilImage from "../assets/pencil.png";

const EditProfileModal = ({
	isOpen,
	onClose,
	onConfirm,
	errorMessage,
	setErrorMessage,
	actualUsername,
	inputCity,
	selectedState,
	picture,
	handleClickSaveChanges,
	successMessage,
	setSuccessMessage,
	submitHandler,
}) => {
	const [tempUsername, setTempUsername] = useState(actualUsername);
	const [tempCity, setTempCity] = useState(inputCity);
	const [tempState, setTempState] = useState(selectedState);
	const [tempPicture, setTempPicture] = useState(picture);
	const [previewPic, setPreviewPic] = useState(tempPicture); // picPreview is just for visual feedback

	const [isModified, setIsModified] = useState(false);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const handleProfilePicChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const fileName = file.name.toLowerCase();
			const fileType = file.type;
			const allowedTypes = [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/gif",
				"image/webp",
				"image/svg+xml",
				"audio/wav",
				"audio/mp3",
				"audio/wma",
				"video/mov",
				"video/mp4",
				"video/avi",
				"video/wmv",
				"video/webm",
			];
			if (file.size <= 10 * 1024 * 1024 && allowedTypes.includes(fileType)) {
				setSuccessMessage("");

				const modifiedFile = new File([file], fileName, { type: fileType });
				setTempPicture(modifiedFile);
				setIsModified(true);

				// Display the potential image in the modal
				const previewUrl = URL.createObjectURL(modifiedFile);
				setPreviewPic(previewUrl);
			} else {
				// File size exceeds the allowed limit or it's not of an allowed type
				if (file.size > 10 * 1024 * 1024) {
					setSuccessMessage(
						language === "en"
							? "Please select an image file under 10MB."
							: "Por favor selecciona un archivo de imagen menor a 10MB."
					);
				} else {
					setSuccessMessage(
						language === "en"
							? "Unsupported file type. Only the following file types are supported: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm"
							: "Tipo de archivo no compatible. Solo se admiten los siguientes tipos de archivo: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm"
					);
				}
				e.target.value = null;
			}
		}
	};

	// Ensures that every time the modal is opened, the text boxes reflect the actual values tied to the user's account
	useEffect(() => {
		if (isOpen) {
			setTempUsername(actualUsername);
			setTempCity(inputCity);
			setTempState(selectedState);
			setTempPicture(picture);
			setPreviewPic(picture);
			setIsModified(false);
		} else {
			setSuccessMessage("");
		}
	}, [isOpen, actualUsername, inputCity, selectedState, picture]);

	// Check if any field has been modified
	useEffect(() => {
		if (
			tempUsername !== actualUsername ||
			tempCity !== inputCity ||
			tempState !== selectedState ||
			tempPicture !== picture
		) {
			setIsModified(true);
		} else {
			setIsModified(false);
		}
	}, [tempUsername, tempCity, tempState, tempPicture, actualUsername, inputCity, selectedState, picture]);

	// Render nothing if not open
	if (!isOpen) return null;

	return (
		<div className="modalOverlay">
			<div className="modalContent">
				<button className="closeButton" onClick={onClose}>
					X
				</button>

				<h3>{language === "en" ? "Edit Profile" : "Editar Perfil"}</h3>

				<div className="profilePicContainer">
					<img src={previewPic} alt="Profile" className="profilePic" />
					<button className="editPicButton" onClick={() => document.getElementById("profilePicInput").click()}>
						<img src={PencilImage} alt="Edit" className="editIcon" />
					</button>
					<input
						type="file"
						id="profilePicInput"
						style={{ display: "none" }}
						onChange={handleProfilePicChange}
						accept="image/*"
					/>
				</div>

				<label className="textboxLabel">
					{language === "en" ? "Username" : "Nombre de Usuario"}
					<br />
				</label>

				<div className="inputWithIcon">
					<img src={UserIconTextboxImage} alt="Username Icon" className="inputIcon" />
					<input
						type="text"
						value={tempUsername}
						onChange={(e) => {
							setTempUsername(e.target.value);
							setSuccessMessage("");
							setIsModified(true);
						}}
						className="textbox"
						placeholder={language === "en" ? "Username" : "Nombre de Usuario"}
					/>
				</div>
				<br />

				<div className="locationLabelsContainer">
					<label className="cityLabel">{language === "en" ? "City" : "Ciudad"}</label>
				</div>

				<div className="inputWithIcon">
					<img src={LocationIconImage} alt="Location Icon" className="inputIcon" />
					<input
						type="text"
						value={tempCity}
						onChange={(e) => {
							setTempCity(e.target.value);
							setSuccessMessage("");
							setIsModified(true);
						}}
						className="textbox"
						placeholder={language === "en" ? "City" : "Ciudad"}
					/>
				</div>

				<button
					className="noButton submitbuttonmodal"
					disabled={!isModified}
					onClick={() => {
						handleClickSaveChanges(tempUsername, tempCity, tempState, tempPicture);
					}}
				>
					{language === "en" ? "Save Changes" : "Guardar Cambios"}
				</button>
				<p
					className={
						language === "en"
							? successMessage === "Please select an image file under 10MB." ||
							  successMessage === "Username already exists. Choose a different username." ||
							  successMessage ===
									"Unsupported file type. Only the following file types are supported: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm" ||
							  successMessage === `Username cannot contain special characters: !@#$%^&*(),.?":{}|<></>` ||
							  successMessage === `City cannot contain special characters: !@#$%^&*().?":{}|<>` ||
							  successMessage === "City must be 35 characters or less." ||
							  successMessage === "Username must be 20 characters or less."
								? "errorMessageText"
								: "dialogueText"
							: successMessage === "Seleccione un archivo de imagen de menos de 10 MB." ||
							  successMessage === "El nombre de usuario ya existe. Elija un nombre de usuario diferente." ||
							  successMessage ===
									"Tipo de archivo no admitido. Solo se admiten los siguientes tipos de archivos: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm" ||
							  successMessage ===
									`El nombre de usuario no puede contener caracteres especiales: !@#$%^&*(),.?":{}|<>` ||
							  successMessage === `La ciudad no puede contener caracteres especiales: !@#$%^&*().?":{}|<>` ||
							  successMessage === "Cuidad debe tener 35 caracteres o menos." ||
							  successMessage === "El nombre de usuario debe tener 20 caracteres o menos."
							? "errorMessageText"
							: "dialogueText"
					}
				>
					{successMessage}
				</p>
			</div>
		</div>
	);
};

export default EditProfileModal;
