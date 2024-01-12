import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ProfileModal from "./ProfileModal";
import EntryEmail from "./EmailModalCondition/EntryEmail";
import EntryEmailCode from "./EmailModalCondition/EntryEmailCode";
import SuccessEmail from "./EmailModalCondition/SuccessEmail";

const AddEmailModal = ({ isOpen, toggleModal, setNewEmail }) => {
	const { t } = useTranslation("Profile");
	const [email, setEmail] = useState("");
	const [currentStep, setCurrentStep] = useState(0);
	const [timeToRetry, setTimeToRetry] = useState(0);

	const stepToValidate = (retryTime) => {
		setTimeToRetry(retryTime);
		setCurrentStep(currentStep + 1);
	};

	const setToSuccess = () => setCurrentStep(currentStep + 1);

	const onCloseHandler = () => {
		toggleModal();
		setEmail("");
		setCurrentStep(0);
		setTimeToRetry(0);
	};

	const modalSteps = [
		{ title: t("email"), component: <EntryEmail key="0" email={email} setEmail={setEmail} onCancelHandler={onCloseHandler} nextModalStep={stepToValidate} /> },
		{
			title: t("verifyEmail"),
			component: <EntryEmailCode key="1" email={email} timeToRetry={timeToRetry} onCancelHandler={onCloseHandler} nextModalStep={setToSuccess} setNewEmail={setNewEmail} />,
		},
		{ title: null, component: <SuccessEmail key="2" onDoneHandler={onCloseHandler} /> },
	];

	return (
		<ProfileModal toggleModal={onCloseHandler} isOpen={isOpen} titleText={modalSteps[currentStep].title}>
			{modalSteps[currentStep].component}
		</ProfileModal>
	);
};

AddEmailModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	setNewEmail: PropTypes.func.isRequired,
};

export default AddEmailModal;
