import React, { Component } from "react";
import { Row, Col, Container } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import SelectLang from "../components/SingleComponents/SelectLang";
import getLanguagePrefix from "../services/getLanguagePrefix";

import fbIcon from "../assets/img/icon/fb.svg";
import twitterIcon from "../assets/img/icon/twitter.svg";
import youtubeIcon from "../assets/img/icon/youtube.svg";
import telegramIcon from "../assets/img/icon/telegram.svg";
import discordIcon from "../assets/img/icon/discord.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});
class Aside extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		location: PropTypes.object.isRequired,
	};

	render() {
		const { t, language, location } = this.props;
		return (
			<div className="top-footer-container">
				<Container>
					<Row className="align-items-stretch justify-content-between">
						<Col xs="12" lg="2" className="footer-block">
							<div className="header-block">
								<p>{t("footer.information")}</p>
							</div>
							<div className="body-block">
								<p>
									<a href="/blog">{t("footer.blog")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/faq`}>{t("footer.faq")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/how-it-works`}>{t("footer.howItWorks")}</a>
								</p>
								<p>
									<Link to={`${getLanguagePrefix(language)}/rank`}>{t("footer.leaderBoard")}</Link>
								</p>
								<p>
									<Link to={`${getLanguagePrefix(language)}/referral`}>{t("footer.referral")}</Link>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/bitcoin-games`}>{t("footer.btcGames")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/play2earn`}>{t("footer.play2Earn")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/solana-faucet`}>{t("footer.solanaFaucet")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/free-tron`}>{t("footer.freeTron")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/free-litecoin`}>{t("footer.freeLitecoin")}</a>
								</p>
								<p>
									<a href={`${getLanguagePrefix(language)}/cryptopedia`}>{t("footer.cryptopedia")}</a>
								</p>
							</div>
						</Col>
						<Col xs="12" lg="2" className="footer-block">
							{!location.pathname.startsWith("/new-game") && (
								<div className="body-block body-block-padding-lg">
									<p>
										<a href={`${getLanguagePrefix(language)}/free-bitcoin`}>{t("footer.freeBtc")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-ethereum`}>{t("footer.freeEth")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-dogecoin`}>{t("footer.freeDoge")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-pepe-coins`}>{t("footer.freePepeCoins")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-shiba-inu`}>{t("footer.freeShiba")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/bitcoin-faucet`}>{t("footer.btcFaucet")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/ethereum-faucet`}>{t("footer.ethFaucet")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/dogecoin-faucet`}>{t("footer.dogeFaucet")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-floki`}>{t("footer.freeFloki")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-bnb`}>{t("footer.freeBNB")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-matic`}>{t("footer.freeMatic")}</a>
									</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/free-solana`}>{t("footer.freeSolana")}</a>
									</p>
								</div>
							)}
						</Col>
						<Col xs="12" lg="4" className="footer-block follow-us">
							<div className="header-block">
								<p>{t("footer.follow")}</p>
							</div>
							<div className="body-block">
								<p>
									<a href="https://twitter.com/rollercoin_com" target="_blank" rel="nofollow noopener noreferrer">
										<img src={twitterIcon} alt="twitter" width="40" height="40" />
									</a>
								</p>
								<p>
									<a href="https://www.youtube.com/channel/UCQqU59_ZGED9Hgm-SVmfisQ" target="_blank" rel="nofollow noopener noreferrer">
										<img src={youtubeIcon} alt="youtube" width="40" height="40" />
									</a>
								</p>
								<p>
									<a href="http://t.me/RollerCoin_official" target="_blank" rel="nofollow noopener noreferrer">
										<img src={telegramIcon} alt="telegram" width="40" height="40" />
									</a>
								</p>
								<p>
									<a href="https://discord.com/invite/EDyWFmN" target="_blank" rel="nofollow noopener noreferrer">
										<img src={discordIcon} alt="discord" width="40" height="40" />
									</a>
								</p>
							</div>
							<SelectLang />
						</Col>
						<Col xs="12" lg={{ size: 2, offset: 2 }} className="footer-block support">
							<div className="header-block">
								<p>{t("footer.contacts")}</p>
							</div>
							<div className="body-block">
								<p>
									<a href="mailto:support@rollercoin.com">support@rollercoin.com</a>
								</p>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default withTranslation("Layout")(connect(mapStateToProps, null)(withRouter(Aside)));
