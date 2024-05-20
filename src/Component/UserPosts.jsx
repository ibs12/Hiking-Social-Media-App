import React, { useEffect, useState } from "react";
import "../Component/UserPosts.css";
import PostsHikerImage from "../assets/posts_hiker.png";
import TestImage from "../assets/testpost.png";
import ProfilePostCard from "../Component/ProfilePostCard";
import ProfilePostModal from "./ProfilePostModal";

const UserPosts = ({ username }) => {
  const [myPosts, setMyPosts] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caption, setCaption] = useState("This is where caption text will go");
  const [locale, setLocale] = useState(
    "Gorge Stairs Trailhead Niagara Falls, NY"
  );
  const [tags, setTags] = useState(["Easy"]);

  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveChanges = (tempCaption, tempLocale, tempTags) => {
    setCaption(tempCaption);
    setLocale(tempLocale);
    setTags(tempTags);

    setSuccessMessage("Changes have been successfully saved");
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, tagIndex) => tagIndex !== index);
    setTags(updatedTags);
  };

  return (
    <div className="LikedArea">
      {myPosts === null ? (
        <>
          <p className="nothingHereText fade-in">
            Nothing to see here... <br />
            When you create posts, they will appear here
          </p>
          <img className="postsHikerImage fade-in" src={PostsHikerImage} alt="hiker" />
        </>
      ) : (
        <>
          <div className="cardsArea fade-in">
            <ProfilePostCard
              image={TestImage}
              onClick={() => setIsModalOpen(true)}
            />
            <ProfilePostModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              image={TestImage}
              username={username}
              setMyPosts={setMyPosts}
              setCaption={setCaption}
              caption={caption}
              setLocale={setLocale}
              locale={locale}
              handleClicked
              setSuccessMessage={setSuccessMessage}
              successMessage={successMessage}
              handleSaveChanges={handleSaveChanges}
              setTags={setTags}
              tags={tags}
              handleDeleteTag={handleDeleteTag}
            ></ProfilePostModal>
          </div>
        </>
      )}
    </div>
  );
};

export default UserPosts;
