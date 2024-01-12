import React, { Fragment } from "react";
import { Row } from "reactstrap";
import PropTypes from "prop-types";
import RewardPuzzleCard from "./RewardPuzzleCard";

import "../../assets/scss/SpinEvent/RewardsPuzzle.scss";

import loaderImg from "../../assets/img/loader_sandglass.gif";

const RewardsPuzzle = ({ eventConfig, isLoading, rewardsData }) => {
	const bannerBackgroundImage = `url("${process.env.STATIC_URL}/static/img/events/spin_event/${eventConfig._id}/${eventConfig.files.progress_img}")`;

	return (
		<Fragment>
			<div className="rewards-puzzle">
				{isLoading && (
					<div className="puzzle-preloader">
						<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
					</div>
				)}
				{!isLoading && (
					<div className="rewards-puzzle-wrapper" style={{ background: `${bannerBackgroundImage} center center / cover no-repeat` }}>
						<div className="puzzle-container">
							<Row className="puzzle-row">
								{!!rewardsData.length &&
									rewardsData.map((reward) => (
										<RewardPuzzleCard key={reward.id} reward={reward} viewMode={eventConfig.view_mode} cols={eventConfig.cols} cellsCount={eventConfig.cells_count} />
									))}
							</Row>
						</div>
					</div>
				)}
			</div>
		</Fragment>
	);
};

RewardsPuzzle.propTypes = {
	eventConfig: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	rewardsData: PropTypes.array.isRequired,
};

export default RewardsPuzzle;
