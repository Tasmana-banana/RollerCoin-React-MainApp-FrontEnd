import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import scrollToElement from "../../services/scrollToElement";

import "../../assets/scss/MarketPagination.scss";

const generatePagingArray = (now, pages) => {
	const delta = 2;
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

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
});

const MarketPagination = ({ options, paginationType, pagesQty, currentPageNumber, productsUpdate, isMobile }) => {
	if (pagesQty <= 1) {
		return [];
	}
	const pagingArray = generatePagingArray(currentPageNumber, pagesQty);

	const switchPageHandler = async (pageNumber, type) => {
		const responseOptions = { ...options };
		responseOptions.skip = options.limit * (pageNumber - 1);
		await productsUpdate(responseOptions, type, pageNumber);
		if (type !== "more") {
			scrollToElement(".select-filters-wrapper", -32);
		}
	};

	return (
		<Row noGutters={isMobile} className="market-pagination">
			{paginationType !== "page" && +pagesQty > +currentPageNumber && (
				<Col xs={{ size: 6, offset: 3 }} lg={{ size: 4, offset: 4 }}>
					<button type="button" className="tree-dimensional-button btn-default w-100 load-more" onClick={() => switchPageHandler(+currentPageNumber + 1, "more")}>
						<span className="btn-text">Load more</span>
					</button>
				</Col>
			)}
			{!isMobile && paginationType !== "more" && (
				<Col xs={12}>
					<ul className="market-pagination-list">
						{pagingArray.map((item) => (
							<li className="market-pagination-item" key={item}>
								{item === "..." && <p className="market-pagination-divider">...</p>}
								{item !== "..." && (
									<button type="button" className="market-pagination-btn" disabled={currentPageNumber === item} onClick={() => switchPageHandler(item, "page")}>
										{item}
									</button>
								)}
							</li>
						))}
					</ul>
				</Col>
			)}
		</Row>
	);
};

MarketPagination.propTypes = {
	options: PropTypes.object.isRequired,
	paginationType: PropTypes.string.isRequired,
	pagesQty: PropTypes.number.isRequired,
	currentPageNumber: PropTypes.number.isRequired,
	productsUpdate: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketPagination));
