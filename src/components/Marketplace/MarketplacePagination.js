import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";
import generatePagingArray from "../../services/generatePagingArray";

import "../../assets/scss/Marketplace/MarketplacePagination.scss";

import loadMoreIcon from "../../assets/img/marketplace/load_more_icon.svg";

const MarketPagination = ({ options, paginationType, pagesQty, currentPageNumber, paginationHandler, turnOffLoadMore = false }) => {
	const { t } = useTranslation("Marketplace");
	const isMobile = useSelector((state) => state.game.isMobile);
	if (pagesQty <= 1) {
		return [];
	}
	const pagingArray = generatePagingArray(currentPageNumber, pagesQty);

	const switchPageHandler = async (pageNumber, type) => {
		const responseOptions = { ...options, skip: options.limit * (pageNumber - 1) };
		await paginationHandler(responseOptions, type, pageNumber);
	};

	return (
		<div className="marketplace-pagination">
			{paginationType !== "page" && +pagesQty > +currentPageNumber && !turnOffLoadMore && (
				<div className="load-more">
					<RollerButton className="load-more-btn" icon={loadMoreIcon} text={t("main.loadMore")} action={() => switchPageHandler(+currentPageNumber + 1, "more")} />
				</div>
			)}
			{paginationType === "all" && <div className="marketplace-pagination-divider" />}
			{paginationType !== "more" && (
				<div className="marketplace-pagination-list-wrapper">
					<ul className="marketplace-pagination-list">
						{pagingArray.map((item) => (
							<li className="marketplace-pagination-item" key={item}>
								{item === "..." && <p className="marketplace-pagination-divider">...</p>}
								{item !== "..." && (
									<button type="button" className="marketplace-pagination-btn" disabled={currentPageNumber === item} onClick={() => switchPageHandler(item, "page")}>
										{item}
									</button>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

MarketPagination.propTypes = {
	options: PropTypes.object.isRequired,
	paginationType: PropTypes.string.isRequired,
	pagesQty: PropTypes.number.isRequired,
	currentPageNumber: PropTypes.number.isRequired,
	paginationHandler: PropTypes.func.isRequired,
	turnOffLoadMore: PropTypes.bool.isRequired,
};

export default MarketPagination;
