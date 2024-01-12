import { MersenneTwister19937, Random } from "random-js";

const Randomize = {
	num(min, max) {
		const randomNum = new Random(MersenneTwister19937.autoSeed());
		return randomNum.integer(min, max);
	},
	frac() {
		const randomNum = new Random(MersenneTwister19937.autoSeed());
		return randomNum.real(0, 1);
	},
	roll(chance) {
		const randomNum = new Random(MersenneTwister19937.autoSeed());
		return randomNum.integer(0, 100) < chance;
	},
};

export default Randomize;
