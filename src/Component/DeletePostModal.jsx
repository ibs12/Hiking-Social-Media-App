import React, { useState, useEffect } from "react";
import "../Component/DeletePostModal.css";
import "../Component/Textbox.css";

const DeletePostModal = ({
    isOpen,
    onClose,
    onConfirm,
}) => {	
    const [language, setLanguage] = useState("en");

    useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

    if (!isOpen) return null;

    return (
        <div className="deleteModal-modalOverlay">
            <div className="deleteModal-modalContent">
                <button className="closeButton" onClick={onClose}>
                    X
                </button>
                <h3 className="deleteModal-title">
                    {language === "en" ? "Delete this post?" : "¿Borrar esta publicación?"}
                </h3>
                <p className="deleteModal-dialogueText">
                    {language === "en"
                        ? "Are you sure you want to continue? This action cannot be undone."
                        : "¿Seguro que deseas continuar? Esta acción no se puede deshacer."}
                </p>
                <div className="deleteModal-buttonsArea">
                    <button className="deleteModal-noButton" onClick={onClose}>
                        {language === "en" ? "No" : "No"}
                    </button>
                    <button className="deleteModal-yesButton" onClick={onConfirm}>
                        {language === "en" ? "Yes" : "Sí"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePostModal;
