import React, { Fragment } from "react";
import PropTypes from "prop-types";

import "../../assets/scss/Game/DailyBonus.scss";

const LastNews = ({ news, isMobile }) => {
	let imgUrl = "";
	let type = "";
	let title = "";
	let date = "";
	let linkUrl = "";
	try {
		imgUrl = news._embedded["wp:featuredmedia"][0].source_url;
		type = news._embedded["wp:term"][0][0].name;
		title = news.title.rendered;
		linkUrl = news.link;
		date = new Date(news.date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
	} catch (e) {
		console.error(e);
		return false;
	}
	return (
		<Fragment>
			{!isMobile && (
				<a className="last-news-wrapper" href={linkUrl} target="_blank" rel="noopener noreferrer">
					<div className="news-img-wrapper">
						<img className="news-img" src={imgUrl} alt="picture" />
					</div>
					<div className="news-desc-wrapper">
						<div>
							<p className="news-type">{type}</p>
							<p className="news-title" dangerouslySetInnerHTML={{ __html: title }} />
						</div>
						<div className="news-date-wrapper">
							<p className="news-date">{date}</p>
						</div>
					</div>
				</a>
			)}
			{isMobile && (
				<a className="last-news-wrapper" href={linkUrl} target="_blank" rel="noopener noreferrer">
					<div className="news-img-wrapper">
						<img className="news-img" src={imgUrl} alt="picture" />
					</div>
					<div className="news-desc-wrapper">
						<div>
							<p className="news-type">{type}</p>
							<p className="news-title">{title}</p>
						</div>
					</div>
				</a>
			)}
		</Fragment>
	);
};

LastNews.propTypes = {
	isMobile: PropTypes.bool.isRequired,
	news: PropTypes.object.isRequired,
};

export default LastNews;
