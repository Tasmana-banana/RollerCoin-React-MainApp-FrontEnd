export default function loadScript(src, async = false, onLoad = null, tags = [], isRemoveAfterLoad = false) {
	const tag = document.createElement("script");
	tag.async = async;
	tag.src = src;
	tag.onerror = () => tag.remove();
	document.body.appendChild(tag);
	const loadScripts = [];
	if (onLoad) {
		loadScripts.push(onLoad);
	}
	if (isRemoveAfterLoad) {
		loadScripts.push(() => tag.remove());
	}
	if (loadScripts.length) {
		tag.onload = () => loadScripts.map((func) => func());
	}
	tags.forEach((obj) => {
		tag[obj.name] = obj.value;
	});
	return tag;
}
