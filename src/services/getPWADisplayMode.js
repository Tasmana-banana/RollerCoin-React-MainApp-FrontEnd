export default function getPWADisplayMode() {
	const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
	if (document.referrer.startsWith("android-app://")) {
		return "twa";
	}
	if (navigator.standalone || isStandalone) {
		return "standalone";
	}
	return "browser";
}
