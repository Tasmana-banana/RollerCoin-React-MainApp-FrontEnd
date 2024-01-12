import React from "react";
import { toast } from "react-toastify";

import successIcon from "../assets/img/icon/success_notice.svg";
import errorIcon from "../assets/img/icon/error_notice.svg";

const renderElectricityToast = (status, message) => {
	return (
		<div className="content-with-image">
			<img src={status ? successIcon : errorIcon} alt="recharged" />
			<span>{message}</span>
		</div>
	);
};

const electricityToast = (status, message) =>
	toast(renderElectricityToast(status, message), {
		position: "top-left",
		autoClose: 3000,
		hideProgressBar: true,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
	});

export default electricityToast;
