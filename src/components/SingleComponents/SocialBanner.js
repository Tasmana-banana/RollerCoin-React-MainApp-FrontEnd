import React from "react";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/SocialBanner.scss";

import fbIcon from "../../assets/img/icon/fb.svg";
import twitterIcon from "../../assets/img/icon/twitter.svg";
import youtubeIcon from "../../assets/img/icon/youtube.svg";
import telegramIcon from "../../assets/img/icon/telegram.svg";
import discordIcon from "../../assets/img/icon/discord.svg";

const iconsData = [
	{
		img: fbIcon,
		url: "https://www.facebook.com/PlayRollerCoin",
		alt: "fb",
	},
	{
		img: twitterIcon,
		url: "https://twitter.com/rollercoin_com",
		alt: "twitter",
	},
	{
		img: telegramIcon,
		url: "https://t.me/RollerCoin_official",
		alt: "telegram",
	},
	{
		img: youtubeIcon,
		url: "https://www.youtube.com/channel/UCQqU59_ZGED9Hgm-SVmfisQ",
		alt: "youtube",
	},
	{
		img: discordIcon,
		url: "https://discord.com/invite/EDyWFmN",
		alt: "discord",
	},
];

const SocialBanner = ({ t }) => (
	<div className="social-banner-container">
		<p className="banner-title">{t("socialBanner.stayTuned")}</p>
		<div className="buttons-container">
			{iconsData.map(({ img, url, alt }) => (
				<a key={alt} href={url} target="_blank" rel="noopener noreferrer">
					<img src={img} className="social-image" alt={alt} />
				</a>
			))}
		</div>
	</div>
);

SocialBanner.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation("Banner")(SocialBanner);
