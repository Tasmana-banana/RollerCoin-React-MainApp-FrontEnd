import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

import "../../assets/scss/SingleComponents/QuestionBanner.scss";
import questionBannerImg from "../../assets/img/singleComponents/questionBanner.png";

const QuestionBanner = () => {
	const onClickHandler = () => {
		localStorage.setItem("is_user_answered_questions", "true");
		window.open("https://docs.google.com/forms/d/e/1FAIpQLSd6AvqA8iTCQkzWPgJDZVxAIdXzXb0fjYW943lRiiVyKvxSYQ/viewform", "_blank");
	};
	return (
		<div className="question-banner-container">
			<h3 className="banner-title">
				We have questions
				<br />
				FOR YOU
			</h3>
			<LazyLoadImage className="banner-img" alt="question" src={questionBannerImg} width="272" height="142" threshold={100} />
			<div className="button-wrapper" onClick={onClickHandler}>
				<button type="button" className="tree-dimensional-button btn-gold w-100">
					<span className="btn-text">Answer</span>
				</button>
			</div>
		</div>
	);
};

export default QuestionBanner;
