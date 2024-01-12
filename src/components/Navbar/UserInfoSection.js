import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Navbar/UserInfoSection.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	fullName: state.user.fullName,
	uid: state.user.uid,
	rank: state.user.rank,
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
	avatarType: state.user.avatarType,
});

class UserInfoSectionClass extends Component {
	static propTypes = {
		fullName: PropTypes.string.isRequired,
		uid: PropTypes.string.isRequired,
		rank: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		avatarVersion: PropTypes.string.isRequired,
		avatarType: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			userRateClass: "",
			userRateProgress: "",
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.rank.position > 1) {
			if (prevProps.rank.position > this.props.rank.position) {
				return this.setState({
					userRateClass: "cyan-text",
					userRateProgress: "arrow_top",
				});
			}
			if (prevProps.rank.position < this.props.rank.position) {
				return this.setState({
					userRateClass: "danger-text",
					userRateProgress: "arrow_down",
				});
			}
		}
	}

	render() {
		const { uid, language, avatarType, avatarVersion } = this.props;
		return (
			<div className="user-information-container">
				<div className="user-icon-header">
					<div className="user-circle">
						{uid !== "" && (
							<Link to={`${getLanguagePrefix(language)}/profile`}>
								<div className={avatarType === "nft" ? "mask-hexagon" : "mask-circle"}>
									<img
										src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/${uid}.png?v=${avatarVersion}`}
										alt="ico"
										width="50"
										height="50"
										className="avatar-icon"
									/>
								</div>
							</Link>
						)}
					</div>
				</div>
				<div className="user-name-position-header">
					<div className="top-block">
						<Link to={`${getLanguagePrefix(language)}/profile`}>
							<p id="user-name">{this.props.fullName}</p>
						</Link>
					</div>
					<div className="bottom-block">
						<Link to={`${getLanguagePrefix(language)}/rank?find-me`} className="rate-find">
							<span id="user-position" className={this.state.userRateClass}>
								{this.state.userRateProgress && <img src={`/static/img/icon/${this.state.userRateProgress}.svg`} alt="rate" />} {this.props.rank.position} <sup>th</sup>
							</span>{" "}
							<span>/</span> <span id="total-users">{this.props.rank.total}</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}
const UserInfoSection = connect(mapStateToProps, null)(UserInfoSectionClass);

export default UserInfoSection;
