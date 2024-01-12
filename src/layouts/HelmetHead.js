import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

const HelmetHead = ({ title, description }) => (
	<Helmet>
		{/* General tags */}
		<title>{title}</title>
		<meta name="description" content={description} />
		{/* OpenGraph tags */}
		<meta name="og:title" content={title} />
		<meta name="og:description" content={description} />
		<meta property="og:image" content="//rollercoin.com/public/static/fav/humster.ico" />
		<link rel="apple-touch-icon" href="//rollercoin.com/public/static/fav/humster.ico" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
	</Helmet>
);
HelmetHead.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
};

export default HelmetHead;
