import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import getPrefixPower from "../../services/getPrefixPower";
import Chart from "../Leaderboard/Chart";
import { getRandImg } from "../Leaderboard/helpers";
import getLanguagePrefix from "../../services/getLanguagePrefix";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
});
class RenderTopUsers extends Component {
	constructor(props) {
		super(props);
		this.goToProfile = this.goToProfile.bind(this);
	}

	static onErrorLoadImg(e) {
		e.target.src = getRandImg();
	}

	goToProfile(userLink) {
		const { language } = this.props;
		if (userLink) {
			this.props.history.push(`${getLanguagePrefix(language)}/p/${userLink}`);
		}
	}

	render() {
		const { avatarVersion } = this.props;
		return this.props.topUsers.map((user, key) => (
			<div className="concrete-miners cursor-pointer" key={key} onClick={() => this.goToProfile(user.public_profile_link)}>
				<div className="miner-info left-info">
					<img src={`/static/img/prize${key + 1}.png`} />
					<div className={user.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
						<img
							src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/30/${user.userid}.png?v=${avatarVersion}`}
							alt="ico"
							width="30"
							height="30"
							className="avatar-icon"
							onError={this.constructor.onErrorLoadImg}
						/>
					</div>
					<span className="name">{user.fullname}</span>
				</div>
				<div className="miner-info right-info">
					<div className="right-percent">
						<div className="progress-container">
							<span className="power">{`${getPrefixPower(user.power).power} ${getPrefixPower(user.power).hashDetail}`}</span>
							<span className="percent p_1">{user.power_change_percent}%</span>
						</div>
						<div className="top10-schedule">
							<Chart data={[...user.power_history]} />
						</div>
					</div>
				</div>
			</div>
		));
	}
}
RenderTopUsers.propTypes = {
	topUsers: PropTypes.array.isRequired,
	history: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
};

export default withRouter(connect(mapStateToProps, null)(RenderTopUsers));
