require('dotenv').config();

import DungeonWasbeer from "./DungeonWasbeer";
import "./mpatches";
import "./SQL";

class Main {

	constructor() {
		DungeonWasbeer.Init();
	}
}

const main = new Main();