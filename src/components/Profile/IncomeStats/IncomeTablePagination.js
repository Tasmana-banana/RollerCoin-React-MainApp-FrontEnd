import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const generatePagingArray = (now, pages, isMobile) => {
	const delta = isMobile ? 1 : 2;
	const left = now - delta;
	const right = now + delta + 1;
	const result = Array.from({ length: pages }, (v, k) => k + 1).filter((i) => i && i >= left && i < right);

	if (result.length > 1) {
		// Add first page and dots
		if (result[0] > 1) {
			if (result[0] > 2) {
				result.unshift("...");
			}
			result.unshift(1);
		}
		// Add dots and last page
		if (result[result.length - 1] < pages) {
			if (result[result.length - 1] !== pages - 1) {
				result.push("...");
			}
			result.push(pages);
		}
	}
	return result;
};

const IncomeTablePagination = ({ pages, now, onChangePage, isLoading }) => {
	if (pages <= 1) {
		return [];
	}
	const isMobile = useSelector((state) => state.game.isMobile);
	const pagingArray = generatePagingArray(now, pages, isMobile);
	return pagingArray.map((item, i) => {
		return (
			<li className={`stats-page-item ${item === "..." ? "empty-item" : ""}`} key={i}>
				{item === "..." && <span>...</span>}
				{item !== "..." && (
					<button className={`stats-page-btn ${+item === now ? "active" : ""}`} onClick={() => onChangePage(item)} disabled={isLoading}>
						{item}
					</button>
				)}
			</li>
		);
	});
};

IncomeTablePagination.propTypes = {
	pages: PropTypes.number.isRequired,
	now: PropTypes.number.isRequired,
	onChangePage: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
};
export default IncomeTablePagination;
