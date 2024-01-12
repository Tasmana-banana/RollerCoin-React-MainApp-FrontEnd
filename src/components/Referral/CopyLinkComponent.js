import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { CopyToClipboard } from "react-copy-to-clipboard";
// Map Redux state to component props
import * as actionsUser from "../../actions/userInfo";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Referral/CopyLinkComponent.scss";

const mapStateToProps = (state) => ({
	referralId: state.user.referralId,
	language: state.game.language,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setReferralId: (state) => dispatch(actionsUser.setReferralId(state)),
});
class CopyLinkComponentClass extends Component {
	static propTypes = {
		referralId: PropTypes.string.isRequired,
		setReferralId: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.copyLinkTimeout = 0;
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.state = {
			copied: false,
		};
	}

	componentDidMount() {
		if (this.props.referralId === "") {
			this.setReferral();
		}
	}

	setCopiedLinkState = () => {
		clearTimeout(this.copyLinkTimeout);
		this.copyLinkTimeout = setTimeout(() => {
			this.setState({
				copied: false,
			});
		}, 3000);
		this.setState({
			copied: true,
		});
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	setReferral = async () => {
		try {
			this.createSignalAndController();
			const json = await fetchWithToken("/api/profile/get-referral-id", {
				method: "POST",
				signal: this.signal,
			});
			if (json.error) {
				return false;
			}
			this.props.setReferralId(json.referral_id);
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { t } = this.props;
		return this.props.referralId !== "" ? (
			<div className="copy-referral-link-block">
				<div className="text-referral-link">
					<p>{t("main.link")}</p>
				</div>
				<div className="link-copy-block">
					<p className="link-block">
						{`https://rollercoin.com/?r=`}
						{this.props.referralId}
					</p>
					<CopyToClipboard text={`https://rollercoin.com/?r=${this.props.referralId}`} onCopy={() => this.setCopiedLinkState()}>
						<button type="button" className="btn btn-default-btn copy-btn">
							{this.state.copied ? t("main.copied") : t("main.copy")}
						</button>
					</CopyToClipboard>
				</div>
			</div>
		) : null;
	}
}
const CopyLinkComponent = withTranslation("Referral")(connect(mapStateToProps, mapDispatchToProps)(CopyLinkComponentClass));

export default CopyLinkComponent;
