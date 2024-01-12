import React from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";

const trophiesDescription = {
	"10001": {
		name: "RC7823",
		img: "win_10001.gif",
		expire_power_time: 72,
		count_games_for_not_expire: 1,
		expire_trophy_time: 24,
	},
	"10002": {
		name: "RollerPredator3000",
		img: "win_10002.gif",
		expire_power_time: 120,
		count_games_for_not_expire: 1,
		expire_trophy_time: 24,
	},
	"10003": {
		name: "RollerMacPro",
		img: "win_10003.gif",
		expire_power_time: 168,
		count_games_for_not_expire: 1,
		expire_trophy_time: 24,
	},
};

const ModalGotTrophy = ({ trophy, show, toggleTrophyWindow }) => {
	if (!trophiesDescription[trophy]) {
		return null;
	}
	return (
		<Modal isOpen={show} toggle={toggleTrophyWindow} centered={true} size="lg" className="roller-modal market-container modal-trophy-container">
			<ModalBody className={"you-win-trophy-modal"} style={{ backgroundImage: `url(/static/img/game/reward/${trophiesDescription[trophy].img})` }}>
				<h3 className="modal-trophy-header text-center">CONGRATULATIONS!!!</h3>
				<p className="trophy-text">
					You have been upgraded to a brand new {trophiesDescription[trophy].name} computer! Now your power will last for {trophiesDescription[trophy].expire_power_time} hours. You should
					win at least {trophiesDescription[trophy].count_games_for_not_expire} game every {trophiesDescription[trophy].expire_trophy_time} hours to keep your new Computer. Otherwise, it
					will be replaced with the basic PC.
				</p>
				<div className="btn-container">
					<button type="button" className="tree-dimensional-button btn-yellow" onClick={toggleTrophyWindow}>
						<span className="w-100">COLLECT REWARD</span>
					</button>
				</div>
			</ModalBody>
		</Modal>
	);
};
ModalGotTrophy.propTypes = {
	trophy: PropTypes.string.isRequired,
	show: PropTypes.bool.isRequired,
	toggleTrophyWindow: PropTypes.func.isRequired,
};
export default ModalGotTrophy;
