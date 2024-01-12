import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import generatePagingArray from "../../services/generatePagingArray";

const Pagination = ({ language, pages, now, typeView }) => {
	if (pages <= 1) {
		return [];
	}
	const pagingArray = generatePagingArray(now, pages);
	return pagingArray.map((item, i) => (
		<li className={`page-item ${item === "..." ? "empty-item" : ""} ${+item === now && typeView === "page" ? "active" : ""}`} key={i}>
			{item === "..." && <span>...</span>}
			{item !== "..." && (
				<Link className="page-link get-page" to={`${getLanguagePrefix(language)}/rank?page=${item}`}>
					{item}
				</Link>
			)}
		</li>
	));
};
Pagination.propTypes = {
	language: PropTypes.string.isRequired,
	typeView: PropTypes.string.isRequired,
	pages: PropTypes.number.isRequired,
	now: PropTypes.number.isRequired,
	getUsers: PropTypes.func.isRequired,
};
export default Pagination;
