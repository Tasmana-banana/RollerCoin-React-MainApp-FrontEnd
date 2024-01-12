import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import scrollToElement from "../../../services/scrollToElement";

import "../../../assets/scss/SystemSaleEvent/SpecialEventPagination.scss";

import arrowIcon from "../../../assets/img/icon/lavand_arrow_right.svg";

const generatePagingArray = (now, pages) => {
	const delta = 1;
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
const SpecialEventPagination = ({ options, pagesQty, currentPageNumber, productsUpdate }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const pagingArray = generatePagingArray(currentPageNumber, pagesQty);
	const switchPageHandler = async (pageNumber) => {
		const responseOptions = { ...options };
		responseOptions.skip = options.limit * (pageNumber - 1);
		productsUpdate({ ...options, ...responseOptions }, pageNumber);
		if (isMobile) {
			scrollToElement(".special-event-products", -32);
		}
	};

	return (
		<Row noGutters={isMobile} className="special-event-pagination">
			<Col xs={12}>
				<ul className="special-pagination-list">
					{pagingArray.map((item) => (
						<>
							{!isMobile && item === 1 && (
								<li className="special-pagination-arrow" key={`arrow_${item}`}>
									<button type="button" className="special-pagination-btn" disabled={currentPageNumber === item} onClick={() => switchPageHandler(currentPageNumber - 1)}>
										<img className="special-pagination-arrow-icon left-arrow" src={arrowIcon} alt="arrow icon" />
									</button>
								</li>
							)}
							<li className="special-pagination-item" key={item}>
								{item === "..." && <p className="special-pagination-divider">...</p>}
								{item !== "..." && (
									<button type="button" className="special-pagination-btn" disabled={currentPageNumber === item} onClick={() => switchPageHandler(item)}>
										{item}
									</button>
								)}
							</li>
							{!isMobile && item === pagesQty && (
								<li className="special-pagination-arrow" key={`arrow_${item}`}>
									<button type="button" className="special-pagination-btn" disabled={currentPageNumber === item} onClick={() => switchPageHandler(currentPageNumber + 1)}>
										<img className="special-pagination-arrow-icon right-arrow" src={arrowIcon} alt="arrow icon" />
									</button>
								</li>
							)}
						</>
					))}
				</ul>
			</Col>
		</Row>
	);
};

SpecialEventPagination.propTypes = {
	options: PropTypes.object.isRequired,
	pagesQty: PropTypes.number.isRequired,
	currentPageNumber: PropTypes.number.isRequired,
	productsUpdate: PropTypes.func.isRequired,
};

export default SpecialEventPagination;
