import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
// import "./EditButtons.css";
import DeletePostModal from './DeletePostModal';

const EditButtons = (ID) => {    
    const [isModalOpen, setModalOpen] = useState(false);
    const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);
    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate(`/gallery/editPost/${ID.ID}`);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleDeletePost = async () => {
        try {
        let url = process.env.REACT_APP_API_PATH + `/posts/${ID.ID}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
            },
        });

        if (response.ok) {
            navigate(-1);
        } else {
            throw new Error('Failed to delete the post');
        }
        } catch (error) {
            console.error("Error deleting the post:", error);
        }
    };

    return (
        <>
            <button className="post-options-button" onClick={handleEditClick}>
                <FontAwesomeIcon icon={faEdit} /> {language === "en" ? "Edit Post" : "Editar Publicación"}
            </button>
            <button className="post-options-button" style={{ color: 'red' }} onClick={handleOpenModal}>
                <FontAwesomeIcon icon={faTrash} /> {language === "en" ? "Delete Post" : "Eliminar Publicación"}
            </button>
            <DeletePostModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDeletePost}
            />
        </>
    );
};

export default EditButtons;
