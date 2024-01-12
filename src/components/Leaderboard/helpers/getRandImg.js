import globalAvatarVersion from "../../../services/globalAvatarVersion";

export default function getRandImg() {
	const src = [
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad9b87ec56c840013e90f86.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad96aab11f6f20013d7ae0c.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ae115c82ca4bc0013857e7f.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad9c6e28e969e0013f45853.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad757fc7d483f0013c835e8.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5afb2d85ff6f350013484cc0.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad7500db2625a001316e298.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad9c5cf8e969e0013f45852.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad98d4211f6f20013d7ae11.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5ad9495b11f6f20013d7ae03.png?v=${globalAvatarVersion.get()}`,
		`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/50/5b2761aa57aa3b0013fc5568.png?v=${globalAvatarVersion.get()}`,
	];
	const rand = Math.round(Math.floor(Math.random() * src.length));
	return src[rand];
}
