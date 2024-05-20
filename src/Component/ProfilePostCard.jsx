import React, { useEffect, useState } from "react";
import "../Component/ProfilePostCard.css";

const ProfilePostCard = ({ image, onClick }) => {
	const [postPicture, setPostPicture] = useState(image);
	return (
		<div
			className="card"
			style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }}
			onClick={onClick}
			tabIndex={0} 
			onKeyDown={(e) => {
				if (e.keyCode === 13) {
					onClick();
				}
			}}
		></div>
	);
};

export default ProfilePostCard;
