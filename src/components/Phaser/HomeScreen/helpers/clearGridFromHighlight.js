const clearGridFromHighlight = (scene, x, y, grid, itemType, itemWidth, itemHeight) => {
	switch (itemType) {
		case "miner":
			removeAndDestroyMinerSprite(scene, x, y, grid, itemWidth);
			break;
		case "rack":
			for (let i = 0; i < itemHeight; i += 1) {
				for (let j = 0; j < itemWidth; j += 1) {
					if (grid[y - i][x + j].type && grid[y - i][x + j].type === "Sprite") {
						grid[y - i][x + j].destroy(true);
						scene.racksPlaces.remove(grid[y - i][x + j]);
					}
				}
			}
			break;
		default:
			break;
	}
};
const removeAndDestroyMinerSprite = (scene, x, y, grid, width) => {
	if (width === 1) {
		scene.minersPlaces.remove(grid[y][x].oneCell);
		grid[y][x].oneCell.destroy(true);
		if (grid[y][x].twoCell) {
			scene.minersPlaces.remove(grid[y][x].twoCell);
			grid[y][x].twoCell.destroy(true);
		} else if (grid[y][x - 1] && grid[y][x - 1].twoCell) {
			scene.minersPlaces.remove(grid[y][x - 1].twoCell);
			grid[y][x - 1].twoCell.destroy(true);
			delete grid[y][x - 1].twoCell;
		}
		grid[y][x] = 0;
	}
	if (width === 2) {
		scene.minersPlaces.remove(grid[y][x].oneCell);
		grid[y][x].oneCell.destroy(true);
		if (grid[y][x].twoCell) {
			scene.minersPlaces.remove(grid[y][x].twoCell);
			grid[y][x].twoCell.destroy(true);
		}
		if (grid[y][x + 1].oneCell) {
			scene.minersPlaces.remove(grid[y][x + 1].oneCell);
			grid[y][x + 1].oneCell.destroy(true);
		}
		grid[y][x + 1] = 0;
		grid[y][x] = 0;
	}
};
export default clearGridFromHighlight;
