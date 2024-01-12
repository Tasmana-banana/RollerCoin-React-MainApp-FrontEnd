import React, { Fragment, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { setPeModalOpen } from "../../actions/game";

import marketBannerMobile from "../../assets/img/market/market-banner-mobile.png";
import marketBannerDesktop from "../../assets/img/market/market-banner-desktop.png";

const MarketBanner = () => {
	const dispatch = useDispatch();
	const isMobile = useSelector((state) => state.game.isMobile);
	const [isShow, setIsShow] = useState(false);

	useEffect(() => {
		const currentDate = new Date().getTime();
		const endUTCTimestamp = 1664927999000; // "2022-10-04T23:59:59" UTC
		if (endUTCTimestamp - currentDate > 0) {
			setIsShow(true);
		}
	}, []);

	return (
		<Fragment>
			{isShow && (
				<div className="market-banner-wrapper">
					<div className="cursor-pointer" onClick={() => dispatch(setPeModalOpen(true))}>
						<LazyLoadImage
							src={isMobile ? marketBannerMobile : marketBannerDesktop}
							width={isMobile ? "345" : "880"}
							height="124"
							alt="Rollercoin store"
							className="market-banner-img"
							threshold={100}
						/>
					</div>
				</div>
			)}
		</Fragment>
	);
};

export default MarketBanner;
