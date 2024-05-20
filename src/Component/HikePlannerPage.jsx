import React, { useEffect, useState } from "react";
import { ExploreAndHikeButton } from "./Buttons";
import "./Buttons.css";
import "./Explore.css";
import "./HikePlannerPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownShortWide,
  faPlus,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import DefaultUserImage from "../assets/default_user.png";

export default function HikePlannerPage() {
  const navigate = useNavigate();
  const [rawPosts, setRawPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sortExpanded, setSortExpanded] = useState(false);
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState("mostRecent");
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/");
      window.location.reload();
      return;
    }
    fetchFriendsAndBlockedUsers(token);
    fetchPosts(token);
  }, []);

  useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

  const fetchFriendsAndBlockedUsers = (token) => {
    let url = `${
      process.env.REACT_APP_API_PATH
    }/connections?toUserID=${sessionStorage.getItem("user")}`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        const friendIDs = result[0]
          .filter((conn) => conn.attributes.status === "Friends")
          .map((c) => c.fromUserID);
        return fetch(
          `${
            process.env.REACT_APP_API_PATH
          }/connections?fromUserID=${sessionStorage.getItem("user")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            const friendsList = [
              ...friendIDs,
              ...data[0]
                .filter((conn) => conn.attributes.status === "Friends")
                .map((c) => c.toUserID),
            ];
            setFriends(friendsList);

            const blocked = new Set();
            data[0].forEach((connection) => {
              if (connection.attributes.status === "Blocked") {
                blocked.add(connection.toUserID);
              }
            });
            setBlockedUsers(blocked);
          });
      });
  };

  const fetchPosts = (token) => {
    let url =
      process.env.REACT_APP_API_PATH +
      '/posts?parentID=&attributes={"path":"type","equals":"hike"}';
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result) {
          setRawPosts(result[0]);
        }
      });
  };

  useEffect(() => {
    let currentUserID = sessionStorage.getItem("user");
    // filter out blocked users
    let filteredPosts = rawPosts.filter(
      (post) => !blockedUsers.has(post.authorID)
    );
    
    // Filter to exclude posts blocked by the current user
    filteredPosts = filteredPosts.filter(post => {
      // Ensure the blockedBy array exists and does not contain the current user's ID
      return !(post.attributes.blockedBy && post.attributes.blockedBy.includes(parseInt(currentUserID)));
    });


    if (filter) {
      filteredPosts = filteredPosts.filter(
        (item) => item.attributes?.tags && item.attributes.tags.includes(filter)
      );
    }

    // privacy filtering
    filteredPosts = filteredPosts.filter(
      (item) =>
        item?.attributes?.privacy != "friends" ||
        friends.includes(item?.authorID) ||
        sessionStorage.getItem("user") == item?.authorID
    );

    // if (sort == "closest") {
    //   posts.sort((a, b) => a.attributes?.distance - b.attributes?.distance);
    // }
    if (sort == "mostRecent") {
      filteredPosts.sort((a, b) => b.id - a.id);
    } else if (sort == "oldest") {
      filteredPosts.sort((a, b) => a.id - b.id);
    }

    // set posts after filtering and sorting
    setPosts(filteredPosts);
  }, [filter, sort, rawPosts, friends, blockedUsers]);

  const toggleFilter = (f) => () => {
    if (filter == f) {
      setFilter(null);
      return;
    }
    setFilter(f);
  };

  const selectSort = (s) => () => {
    setSort(s);
    setSortExpanded(false);
  };

  return (
    <div className="page fade-in">
      <div className="explore-header">
        <h1>{language === "en" ? "Hikes" : "Excursiones"}</h1>
        <ExploreAndHikeButton />
      </div>
      <div className="control-wrapper">
        <div className="filter-container">
          <button
            className={`pill-button orange ${
              filter == "trail" ? "active" : ""
            }`}
            onClick={toggleFilter("trail")}
          >
            {language === "en" ? "Trail Hikes" : "Caminatas"}
          </button>
          <button
            className={`pill-button purple ${
              filter == "mountain" ? "active" : ""
            }`}
            onClick={toggleFilter("mountain")}
          >
            {language === "en" ? "Mountains" : "Montañas"}
          </button>
          <button
            className={`pill-button aqua ${filter == "lakes" ? "active" : ""}`}
            onClick={toggleFilter("lakes")}
          >
            {language === "en" ? "Lakes" : "Lagos"}
          </button>
          <button
            className={`pill-button blue ${
              filter == "forests" ? "active" : ""
            }`}
            onClick={toggleFilter("forests")}
          >
            {language === "en" ? "Forests" : "Bosques"}
          </button>
          <button
            className={`pill-button brown ${filter == "urban" ? "active" : ""}`}
            onClick={toggleFilter("urban")}
          >
            {language === "en" ? "Urban" : "Urbano"}
          </button>
          <button
            className={`pill-button light-blue ${
              filter == "coastal" ? "active" : ""
            }`}
            onClick={toggleFilter("coastal")}
          >
            {language === "en" ? "Coastal" : "Costero"}
          </button>
          <button
            className={`pill-button yellow ${
              filter == "desert" ? "active" : ""
            }`}
            onClick={toggleFilter("desert")}
          >
            {language === "en" ? "Desert" : "Desierto"}
          </button>
          <button
            className={`pill-button light-green ${
              filter == "wetlands" ? "active" : ""
            }`}
            onClick={toggleFilter("wetlands")}
          >
            {language === "en" ? "Wetlands" : "Humedales"}
          </button>
          <button
            className={`pill-button dark-purple ${
              filter == "tundra" ? "active" : ""
            }`}
            onClick={toggleFilter("tundra")}
          >
            {language === "en" ? "Tundra" : "Tundra"}
          </button>
          <button
            className={`pill-button green ${
              filter == "day_hike" ? "active" : ""
            }`}
            onClick={toggleFilter("day_hike")}
          >
            {language === "en" ? "Day Hikes" : "Excursiones de un día"}
          </button>
          <button
            className={`pill-button pink ${
              filter == "backpacking" ? "active" : ""
            }`}
            onClick={toggleFilter("backpacking")}
          >
            {language === "en" ? "Backpacking" : "Mochilero"}
          </button>
          <button
            className={`pill-button difficulty-easy ${
              filter == "easy" ? "active" : ""
            }`}
            onClick={toggleFilter("easy")}
          >
            {language === "en" ? "Easy" : "Fácil"}
          </button>
          <button
            className={`pill-button difficulty-medium ${
              filter == "medium" ? "active" : ""
            }`}
            onClick={toggleFilter("medium")}
          >
            {language === "en" ? "Medium" : "Medio"}
          </button>
          <button
            className={`pill-button difficulty-hard ${
              filter == "hard" ? "active" : ""
            }`}
            onClick={toggleFilter("hard")}
          >
            {language === "en" ? "Hard" : "Difícil"}
          </button>
        </div>
        <div className="sort-container">
          <button
            className="pill-button"
            onClick={() => {
              setSortExpanded(!sortExpanded);
            }}
          >
            <FontAwesomeIcon icon={faArrowDownShortWide} />
          </button>
          <div
            className={`sort-dropdown ${
              sortExpanded ? "sort-dropdown-active" : ""
            }`}
          >
            <button className="explore-sort-button" onClick={selectSort("mostRecent")}>
              {language === "en" ? "Most Recent" : "Más Reciente"}
            </button>
            <button className="explore-sort-button" onClick={selectSort("oldest")}>
              {language === "en" ? "Oldest" : "Más Antiguo"}
            </button>
          </div>
        </div>
      </div>
      <div className="hike-grid">
        {posts.map((p) => (
          <div key={p.id} className={`post`}>
            <div className="hike-planner-card">
              <h2 className="hike-planner-card-title">
                {p?.attributes?.title?.substring(0, 20)}
                {p?.attributes?.title?.length > 20 ? "..." : ""}
              </h2>
              <div className="hike-planner-card-location-container">
                <FontAwesomeIcon
                  className="post-location-icon"
                  icon={faLocationDot}
                />
                <span className="post-location-text">
                  {p?.attributes?.location}
                </span>
              </div>
              <div className="hike-planner-card-profile-container">
                <div className="post-profile-img">
                  <Link
                    to={
                      p?.author?.id === sessionStorage.getItem("user")
                        ? "/settings"
                        : `/profile/${p?.author?.id}`
                    }
                    className="link"
                  >
                    <img
                      src={p?.author?.attributes?.picture || DefaultUserImage}
                      alt={p?.author?.attributes?.username || "username"}
                    />
                  </Link>
                </div>
                <div className="post-profile-info">
                  <Link
                    to={
                      p?.author?.id === sessionStorage.getItem("user")
                        ? "/settings"
                        : `/profile/${p?.author?.id}`
                    }
                    className="link"
                  >
                    <span className="post-profile-info-author">
                      {p?.author?.attributes?.username}
                    </span>
                  </Link>

                  <span className="post-profile-info-bio">
                    {p?.author?.attributes?.bio}
                  </span>
                </div>
              </div>

              <span className="hike-planner-card-cta">
                {language === "en" ? "Interested?" : "¿Interesado?"}
              </span>
              <Link to={`/hikes/post/${p.id}`} className="pill-button black">
                {language === "en" ? "Learn More" : "Aprende Más"}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="new-post-container">
        <Link className="circle-button green" to="/hikes/post">
          <FontAwesomeIcon icon={faPlus} />
        </Link>
      </div>
    </div>
  );
}
