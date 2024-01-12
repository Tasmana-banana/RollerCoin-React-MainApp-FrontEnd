import React from "react";
import { Col, Container, Modal, ModalBody, Row, Table } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import "../../assets/scss/Wallet/CheckWithdrawModal.scss";

const CheckWithdrawModal = (props) => {
	const { showModal, onConfirm, info } = props;
	const { t } = useTranslation("Wallet");
	return (
		<div>
			<Modal isOpen={showModal} centered={true} className="roller-modal check-withdraw-modal">
				<ModalBody className="check-withdraw-modal-wrapper">
					<h1 className="title">{t("checkWithdraw.pleaseCheck")}:</h1>
					<div className="withdraw-info-block">
						<table>
							<tbody>
								<tr>
									<td>{t("checkWithdraw.currency")}:</td>
									<td className="currency">{info.currency}</td>
								</tr>
								<tr>
									<td>{t("checkWithdraw.network")}:</td>
									<td className="network">{info.network}</td>
								</tr>
								<tr>
									<td>{t("checkWithdraw.address")}:</td>
									<td className="address word-break">{info.address}</td>
								</tr>
								<tr>
									<td className="amount word-break">{t("checkWithdraw.amount")}:</td>
									<td>{info.amount}</td>
								</tr>
								<tr>
									<td>{t("checkWithdraw.fees")}:</td>
									<td className={`${info.hasFee ? "" : "fee-free"}`}>{info.hasFee ? `${info.network} network fee` : t("free")}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="d-flex flex-wrap flex-lg-nowrap">
						<div className="tree-dimensional-button w-100 btn-cyan mr-lg-4 modal-btn confirm-btn" onClick={onConfirm.bind(null, true)}>
							<span>{t("checkWithdraw.confirmButton")}</span>
						</div>
						<div className="tree-dimensional-button w-100 btn-default modal-btn" onClick={onConfirm.bind(null, false)}>
							<span>{t("checkWithdraw.cancel")}</span>
						</div>
					</div>
				</ModalBody>
			</Modal>
		</div>
	);
};

CheckWithdrawModal.propTypes = {
	showModal: PropTypes.bool.isRequired,
	onConfirm: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	info: PropTypes.shape({
		currency: PropTypes.string.isRequired,
		network: PropTypes.string.isRequired,
		address: PropTypes.string.isRequired,
		amount: PropTypes.string.isRequired,
		hasFee: PropTypes.bool.isRequired,
	}),
};

export default CheckWithdrawModal;
