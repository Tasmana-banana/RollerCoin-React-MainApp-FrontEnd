import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import UAParser from "ua-parser-js";
import QRCode from "qrcode.react";
import RollerButton from "../../SingleComponents/RollerButton";

import giftIcon from "../../../assets/img/pwa/gift_box_small.gif";
import bigGiftIcon from "../../../assets/img/pwa/gift_box_big.gif";
import shareIcon from "../../../assets/img/pwa/share.svg";
import plusIcon from "../../../assets/img/pwa/plus.svg";
import moreIcon from "../../../assets/img/pwa/more-android.svg";
import installIcon from "../../../assets/img/pwa/install-android.svg";
import closeIcon from "../../../assets/img/header/close_menu.svg";
import ios1Icon from "../../../assets/img/pwa/ios-1.png";
import ios2Icon from "../../../assets/img/pwa/ios-2.png";
import ios3Icon from "../../../assets/img/pwa/ios-3.png";
import android1Icon from "../../../assets/img/pwa/android-1.png";
import android2Icon from "../../../assets/img/pwa/android-2.png";
import android3Icon from "../../../assets/img/pwa/android-3.png";

const PwaFullscreenModal = ({ isModalOpen, closeModalHandler, rewardText, isAppInstalled, claimReward }) => {
	const { t } = useTranslation("Game");
	const [isMobile, setIsMobile] = useState("");
	const [deviceOs, setDeviceOs] = useState("");

	useEffect(() => {
		const parser = new UAParser();
		const deviceType = parser.getDevice().type;
		const osName = parser.getOS().name;
		const isMobileTemp = ["tablet", "mobile"].includes(deviceType);
		setIsMobile(isMobileTemp);

		if (isMobileTemp) {
			switch (osName) {
				case "Android": {
					setDeviceOs("android");
					break;
				}
				case "iOS": {
					setDeviceOs("ios");
					break;
				}
				default: {
					setDeviceOs("");
				}
			}
		}
	}, []);

	return (
		<Modal isOpen={isModalOpen} toggle={closeModalHandler} backdrop="static" centered={true} className="pwa-fullscreen-modal" backdropClassName="pwa-fullscreen-modal-backdrop">
			<ModalBody className="pwa-modal-body">
				<button className="pwa-modal-close-btn" onClick={closeModalHandler}>
					<span>
						<img src={closeIcon} width={16} height={16} alt="close_modal" />
					</span>
				</button>
				{!isAppInstalled && (
					<Fragment>
						{rewardText && (
							<div className="title-block">
								{!isMobile && <h2 className="title with-padding">{t("PWA.havePhone")}</h2>}
								<LazyLoadImage width={isMobile ? 74 : 100} height={isMobile ? 74 : 100} src={giftIcon} alt="PWA" threshold={100} className="pwa-gift-image" />
								<p className="prize-text">{t("PWA.installationReward")}</p>
								<div className="reward-text-wrapper">
									<p className="reward-text">
										{t("PWA.get")} {rewardText}
									</p>
								</div>
							</div>
						)}
						{!rewardText && (
							<div className="title-block">
								<h2 className="title with-padding">{t("PWA.threeSteps")}</h2>
							</div>
						)}
						{!isMobile && (
							<div className="guide-block">
								<div className="qr-code-block">
									<div className="qr-code-wrapper">
										<QRCode value={`${process.env.APP_URL}/game`} fgColor="#1f1f2d" includeMargin={true} size={200} />
									</div>
								</div>
								<div className="guide-description-wrapper">
									<p className="guide-description-text">{t("PWA.scan")}</p>
									<p className="guide-description-text accent-text">{t("PWA.toClaim")}</p>
								</div>
							</div>
						)}
						{isMobile && (
							<Fragment>
								{deviceOs === "ios" && (
									<Fragment>
										<div className="guide-block">
											<LazyLoadImage className="guide-img" src={ios1Icon} width={400} height={150} alt="guide" />
											<div className="guide-text-wrapper">
												<p className="guide-text">{t("PWA.tap")}</p>
												<LazyLoadImage className="share-icon" src={shareIcon} width={32} height={32} alt="share" />
												<p className="guide-text">
													{t("PWA.share")}
													<span className="guide-text-info"> (Safari only)</span>
												</p>
											</div>
										</div>
										<div className="guide-block">
											<LazyLoadImage className="guide-img" src={ios2Icon} width={400} height={108} alt="guide" />
											<div className="guide-text-wrapper">
												<p className="guide-text">{t("PWA.tap")}</p>
												<LazyLoadImage className="share-icon" src={plusIcon} width={32} height={32} alt="share" />
												<p className="guide-text">{t("PWA.addToHome")}</p>
											</div>
										</div>
										{!rewardText && (
											<div className="guide-block">
												<LazyLoadImage className="guide-img" src={ios3Icon} width={400} height={150} alt="guide" />
												<div className="guide-text-wrapper">
													<p className="guide-text">{t("PWA.launchApp")}</p>
												</div>
											</div>
										)}
									</Fragment>
								)}
								{deviceOs !== "ios" && (
									<Fragment>
										<div className="guide-block">
											<LazyLoadImage className="guide-img" src={android1Icon} width={400} height={124} alt="guide" />
											<div className="guide-text-wrapper">
												<p className="guide-text">{t("PWA.tap")}</p>
												<LazyLoadImage className="share-icon" src={moreIcon} width={32} height={32} alt="share" />
												<p className="guide-text">{t("PWA.openMenu")}</p>
											</div>
										</div>
										<div className="guide-block">
											<LazyLoadImage className="guide-img" src={android2Icon} width={400} height={128} alt="guide" />
											<div className="guide-text-wrapper">
												<p className="guide-text">{t("PWA.tap")}</p>
												<LazyLoadImage className="share-icon" src={installIcon} width={32} height={32} alt="share" />
												<p className="guide-text">{t("PWA.andInstall")}</p>
											</div>
										</div>
										{!rewardText && (
											<div className="guide-block">
												<LazyLoadImage className="guide-img" src={android3Icon} width={400} height={150} alt="guide" />
												<div className="guide-text-wrapper">
													<p className="guide-text">{t("PWA.launchApp")}</p>
												</div>
											</div>
										)}
									</Fragment>
								)}
							</Fragment>
						)}
					</Fragment>
				)}
				{isAppInstalled && (
					<div className="title-block">
						<LazyLoadImage width={isMobile ? 240 : 288} height={isMobile ? 240 : 288} src={bigGiftIcon} alt="PWA" threshold={100} className="pwa-done-gift-image" />
						<h2 className="title">{t("PWA.wellDone")}</h2>
						<p className="prize-text">{t("PWA.viaHome")}</p>
						<div className="pwa-button-block">
							<RollerButton text={t("PWA.claimGift")} action={claimReward} color="cyan" width={100} className="pwa-button" />
						</div>
					</div>
				)}
			</ModalBody>
		</Modal>
	);
};

PwaFullscreenModal.propTypes = {
	isModalOpen: PropTypes.bool.isRequired,
	closeModalHandler: PropTypes.func.isRequired,
	rewardText: PropTypes.string.isRequired,
	isAppInstalled: PropTypes.bool.isRequired,
	claimReward: PropTypes.func.isRequired,
};

export default PwaFullscreenModal;
