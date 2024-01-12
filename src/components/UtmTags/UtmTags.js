import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import cookie from "react-cookies";
import fetchWithToken from "../../services/fetchWithToken";

const UtmTags = ({ children }) => {
	const isAuthorizedSocket = useSelector((state) => state.user.isAuthorizedSocket);
	const isAuthorizedNode = useSelector((state) => state.user.isAuthorizedNode);
	const location = useLocation();

	let controller = new AbortController();
	let signals = controller.signal;

	const createSignalAndController = () => {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		signals = controller.signal;
	};

	const saveUtmTags = async (utmTags) => {
		try {
			createSignalAndController();
			const json = await fetchWithToken("/api/analytic/save-utm-tags", {
				method: "POST",
				signal: signals,
				body: JSON.stringify(utmTags),
			});
			if (!json.success) {
				if (json.error !== "Invalid body value") {
					localStorage.setItem("utm_tags", JSON.stringify(utmTags));
				}
				return false;
			}
			localStorage.removeItem("utm_tags");
		} catch (e) {
			console.error(e);
		}
	};

	const validateUtmTags = (utmTags) => {
		const { utm_source: utmSource, utm_campaign: utmCampaign, utm_medium: utmMedium, utm_term: utmTerm, utm_content: utmContent, utm_creative: utmCreative } = utmTags;
		const isUtmSourceValid = !utmSource || typeof utmSource !== "string";
		const isUtmCampaignValid = !utmCampaign || typeof utmCampaign !== "string";
		const isUtmMediumValid = !utmMedium || typeof utmMedium !== "string";
		const isUtmTermValid = typeof utmTerm !== "string";
		const isUtmContentValid = typeof utmContent !== "string";
		const isUtmCreativeValid = typeof utmCreative !== "string";
		return isUtmSourceValid || isUtmCampaignValid || isUtmMediumValid || isUtmTermValid || isUtmContentValid || isUtmCreativeValid;
	};

	const checkUtmTags = async (queryString) => {
		const queryObject = new URLSearchParams(queryString);
		const clickId = queryObject.get("clickid");
		if (clickId) {
			cookie.save("clickid", clickId, { path: "/" });
		}
		const offerOneId = queryObject.get("click_id");
		if (offerOneId) {
			cookie.save("offerOneId", offerOneId, { path: "/" });
		}
		const fbPixel = queryObject.get("fbpixel");
		if (fbPixel) {
			localStorage.setItem("fbpixel", fbPixel);
		}
		const containsRightTags = queryObject.has("utm_source") && queryObject.has("utm_campaign") && queryObject.has("utm_medium");
		if (!containsRightTags) {
			return false;
		}
		const utmTags = {
			utm_source: queryObject.get("utm_source"),
			utm_campaign: queryObject.get("utm_campaign"),
			utm_medium: queryObject.get("utm_medium"),
			utm_term: queryObject.get("utm_term") || "",
			utm_content: queryObject.get("utm_content") || "",
			utm_creative: queryObject.get("utm_creative") || "",
		};
		if (validateUtmTags(utmTags)) {
			return false;
		}
		if (!isAuthorizedNode && !isAuthorizedSocket) {
			return localStorage.setItem("utm_tags", JSON.stringify(utmTags));
		}
		await saveUtmTags(utmTags);
	};

	const delayedSend = async () => {
		try {
			if (!isAuthorizedSocket || !isAuthorizedNode) {
				return false;
			}
			const utmTags = JSON.parse(localStorage.getItem("utm_tags"));
			if (!utmTags || validateUtmTags(utmTags)) {
				return false;
			}
			await saveUtmTags(utmTags);
		} catch (error) {
			console.error(error);
		}
	};

	const unmountAboard = () => {
		if (controller) {
			controller.abort();
		}
	};

	useEffect(() => {
		delayedSend();
	}, [isAuthorizedSocket, isAuthorizedNode]);

	useEffect(() => {
		checkUtmTags(location.search);
	}, [location.search]);

	useEffect(() => unmountAboard, []);

	return <Fragment>{children}</Fragment>;
};
UtmTags.propTypes = {
	children: PropTypes.node.isRequired,
};
export default UtmTags;
