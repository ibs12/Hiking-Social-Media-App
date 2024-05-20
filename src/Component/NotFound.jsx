import Lost from "../assets/lost.png"
import "./NotFound.css"

const NotFoundPage = () => {
	return (
		<div className="not-found-page fade-in">
			<h1>404 Not Found</h1>
            <p>The page you're looking for does not exist.</p>
            <img className="lost-image" src={Lost} alt="Lost" />
		</div>
	);
};
export default NotFoundPage;
