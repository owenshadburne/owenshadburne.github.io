import { Types, TypeList } from "/Include/RPS/types.js";

class AI {
    getMove() {
        return this.getRandomMove();
    }

    getRandomMove() {
        const rand = Math.random();
        const value = Math.floor(rand * TypeList.length);
        return Types[TypeList[value]];
    }
}

const ai = new AI();
export default ai;