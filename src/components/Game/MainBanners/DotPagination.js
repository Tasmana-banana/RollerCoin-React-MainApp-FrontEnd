import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const FLIP_THROUGH_TIME = 5000;

const DotPagination = ({ className, page, setPage, currentPage, totalPages, isStopAutoSlide }) => {
	const autoNextSlideRef = useRef(null);

	useEffect(() => {
		if (page === currentPage && totalPages > 1 && !isStopAutoSlide) {
			autoNextSlide();
		}
		if (autoNextSlideRef.current && isStopAutoSlide) {
			clearInterval(autoNextSlideRef.current);
		}
		if (page !== currentPage && autoNextSlideRef.current) {
			clearInterval(autoNextSlideRef.current);
		}
	}, [currentPage, isStopAutoSlide]);

	useEffect(() => {
		return () => {
			if (autoNextSlideRef.current) {
				clearInterval(autoNextSlideRef.current);
			}
		};
	}, []);

	const autoNextSlide = () => {
		if (autoNextSlideRef.current) {
			clearInterval(autoNextSlideRef.current);
		}

		autoNextSlideRef.current = setInterval(() => {
			setPage(page >= totalPages ? 1 : page + 1);
		}, FLIP_THROUGH_TIME);
	};

	return (
		<span className={className} onClick={() => setPage(page)}>
			{currentPage === page && <span className="dot-progress" style={{ animation: isStopAutoSlide ? "none" : `linear autoslide ${FLIP_THROUGH_TIME / 1000}s` }} />}
		</span>
	);
};

DotPagination.propTypes = {
	className: PropTypes.string.isRequired,
	page: PropTypes.number.isRequired,
	setPage: PropTypes.func.isRequired,
	currentPage: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	isStopAutoSlide: PropTypes.bool.isRequired,
};

export default DotPagination;
