import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import formatNumbers from "../../services/formatNumbers";
import { getRandImg } from "../Leaderboard/helpers";
import getRandomName from "../../services/getRandomName";
import getLanguagePrefix from "../../services/getLanguagePrefix";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
});

class Cups extends Component {
	static propTypes = {
		lg: PropTypes.number.isRequired,
		xs: PropTypes.number.isRequired,
		startIndex: PropTypes.number.isRequired,
		images: PropTypes.array.isRequired,
		srcSetImages: PropTypes.array.isRequired,
		index: PropTypes.number.isRequired,
		additionalStyle: PropTypes.string.isRequired,
		data: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		avatarVersion: PropTypes.string.isRequired,
	};

	static defaultProps = {
		additionalStyle: "",
		srcSetImages: [],
	};

	static onErrorLoadImg(e) {
		e.target.src = getRandImg();
	}

	render() {
		const { lg, startIndex, images, index, history, data, srcSetImages, language, avatarVersion } = this.props;
		let { additionalStyle, xs } = this.props;
		let image = images[0];
		let userName = data.user_name;

		if (images.length > 1) {
			image = images[index];
		}
		if (startIndex === 0 && index === 0) {
			additionalStyle += "order-lg-2";
			xs = 12;
		}
		if (startIndex === 0 && index === 1) {
			additionalStyle += "order-lg-1";
		}
		if (startIndex === 0 && index === 2) {
			additionalStyle += "order-lg-3";
		}
		if (!userName) {
			userName = getRandomName();
		}
		return (
			<Col xs={xs} lg={lg} className={`hall-item-center ${additionalStyle}`}>
				<div className="hall-item-padding">
					<div className="hall-item-img text-center">
						{!!srcSetImages.length && !!index && (
							<LazyLoad offset={100}>
								<picture onClick={() => history.push(`${getLanguagePrefix(language)}/p/${data.public_profile_link}`)}>
									<source media="(min-width: 1200px)" srcSet={image} />
									<source media="(min-width: 991px)" srcSet={srcSetImages[index - 1]} />
									<source media="(min-width: 320px)" srcSet={image} />
									<img src={image} alt="Hall of fame" />
								</picture>
							</LazyLoad>
						)}
						{(!srcSetImages.length || (!startIndex && !index)) && (
							<LazyLoad offset={100}>
								<img src={image} alt="Hall of fame" onClick={() => history.push(`${getLanguagePrefix(language)}/p/${data.public_profile_link}`)} />
							</LazyLoad>
						)}
						{startIndex === 11 && <p className="top-hundred-number">{startIndex + index}</p>}
					</div>
					<div className="hall-item-amount text-center" onClick={() => history.push(`${getLanguagePrefix(language)}/p/${data.public_profile_link}`)}>
						<p className="hall-item-rtl">{`${formatNumbers(data.amount)}`}</p>
					</div>
					<div className="hall-item-info" onClick={() => history.push(`${getLanguagePrefix(language)}/p/${data.public_profile_link}`)}>
						<div className="hall-item-icon">
							<LazyLoad offset={100}>
								<img
									src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/30/${data._id}.png?v=${avatarVersion}`}
									alt={data._id}
									width={30}
									height={30}
									onError={this.constructor.onErrorLoadImg}
								/>
							</LazyLoad>
						</div>
						<p className="hall-item-name text-left">{userName}</p>
					</div>
				</div>
			</Col>
		);
	}
}
export default withRouter(connect(mapStateToProps, null)(Cups));
