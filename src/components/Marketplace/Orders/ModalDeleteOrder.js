import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import fetchWithToken from "../../../services/fetchWithToken";

import Captcha from "../../Captcha/Captcha";
import RollerButton from "../../SingleComponents/RollerButton";

import successNotice from "../../../assets/img/icon/success_notice.svg";
import errorNotice from "../../../assets/img/icon/error_notice.svg";

import "../../../assets/scss/Marketplace/MyOrdersDeleteModal.scss";

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={icon} alt="market notification" />
		<span>{text}</span>
	</div>
);

const ModalDeleteOrder = ({ deleteModal, stateChanger, closeDeleteModalHandler, deleteHandler }) => {
	const { t } = useTranslation("Marketplace");
	const fingerprint = useSelector((state) => state.user.fingerprint);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [captchaModalIsOpen, setCaptchaModalIsOpen] = useState(false);
	const [challenge, setChallenge] = useState("");
	const [captchaWidth, setCaptchaWidth] = useState("300px");
	const [captchaHeight, setCaptchaHeight] = useState("300px");
	const [captchaMaxDots, setCaptchaMaxDots] = useState(5);

	const signals = {};
	const controllers = {};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	useEffect(async () => {
		const captcha = await getCaptchaStatus(fingerprint);
		if (captcha && captcha.is_captcha_required) {
			setChallenge(captcha.challenge);
			setCaptchaWidth(captcha.width);
			setCaptchaHeight(captcha.height);
			setCaptchaMaxDots(captcha.max_dots);
			setCaptchaModalIsOpen(true);
		} else {
			setIsModalOpen(true);
		}
	}, []);

	const deleteOrderHandler = async (orderId) => {
		createSignalAndController("deleteSaleOrder");
		stateChanger("isLoading", true);
		closeDeleteModalHandler();
		const apiUrl = `/api/marketplace/seller/delete-order`;
		try {
			const body = JSON.stringify({ orderId, challenge });
			const json = await fetchWithToken(apiUrl, {
				method: "POST",
				body,
				signal: signals.deleteSaleOrder,
			});
			if (!json.success) {
				return toast(renderToast(json.error, errorNotice));
			}
			if (json.success) {
				deleteHandler(orderId, deleteModal.item_type);
				toast(renderToast(t("orders.successDeleteOrder"), successNotice));
			}
		} catch (e) {
			console.error(e);
		} finally {
			stateChanger("isLoading", false);
		}
	};

	const getCaptchaStatus = async (fp) => {
		createSignalAndController("getCaptchaStatus");
		const query = new URLSearchParams({ fingerprint: fp });
		try {
			const res = await fetchWithToken(`/api/marketplace/captcha-status?${query.toString()}`, {
				method: "GET",
				signal: signals.getCaptchaStatus,
			});
			if (!res.success) {
				console.error(res.error);
				return null;
			}
			return res.data;
		} catch (e) {
			console.error(e);
			return null;
		}
	};

	const onCaptchaSuccess = async () => {
		await deleteOrderHandler(deleteModal.orderId);
	};

	const onCaptchaFail = (error) => {
		toast(renderToast(error.message, errorNotice), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
		setCaptchaModalIsOpen(false);
	};

	const onConfirmHandler = async () => {
		await deleteOrderHandler(deleteModal.orderId);
	};

	const onToggleCaptcha = () => {
		setCaptchaModalIsOpen(!captchaModalIsOpen);
		closeDeleteModalHandler();
	};

	return (
		<Fragment>
			<Captcha
				isOpen={captchaModalIsOpen && challenge}
				toggle={onToggleCaptcha}
				width={captchaWidth}
				height={captchaHeight}
				maxDots={captchaMaxDots}
				challenge={challenge}
				onSuccess={onCaptchaSuccess}
				onFail={onCaptchaFail}
			/>
			<Modal isOpen={isModalOpen} toggle={closeDeleteModalHandler} centered={true} className="myorders-modal">
				<ModalBody className="myorders-modal-wrapper">
					<div className="title-block">
						<h2 className="title">{t("orders.deleteModalTitle")}</h2>
					</div>
					<div className="text-block">
						<p className="text">{t("orders.deleteModalText")}</p>
					</div>

					<div className="button-block">
						<RollerButton text={t("orders.deleteModalBtnRemove")} color="cyan" className="myorders-modal-button" action={onConfirmHandler} />
						<RollerButton text={t("orders.modalBtnCancel")} action={closeDeleteModalHandler} className="myorders-modal-button" />
					</div>
				</ModalBody>
			</Modal>
		</Fragment>
	);
};

ModalDeleteOrder.propTypes = {
	id: PropTypes.string,
	deleteModal: PropTypes.bool,
	stateChanger: PropTypes.func.isRequired,
	closeDeleteModalHandler: PropTypes.bool,
	deleteHandler: PropTypes.func.isRequired,
};

export default ModalDeleteOrder;
