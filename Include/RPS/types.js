class Type {
    constructor(stats) {
        const { name, winAgainst } = stats;
        this.name = name;
        this.multiplier = 1;
        this.winAgainst = winAgainst;
    }

    attack(aiType) {
        if(aiType.toString() == this.name) {
            return 0;
        }

        for(const win of this.winAgainst) {
            if(aiType.toString() == win) {
                return 1;
            }
        }

        return -1;
    }

    setMultiplier(value) {
        this.multiplier = value;
    }
    getMultiplier(value) {
        return this.multiplier;
    }

    toString() {
        return this.name;
    }
}

class Rock extends Type {    
    constructor() {
        const stats = {
            name: "Rock",
            winAgainst: ["Scissors"]
        }

        super(stats);
    }
}
class Paper extends Type {
    constructor() {
        const stats = {
            name: "Paper",
            winAgainst: ["Rock"]
        };

        super(stats);
    }
}
class Scissors extends Type {
    constructor() {
        const stats = {
            name: "Scissors",
            winAgainst: ["Paper"]
        };

        super(stats);
    }
}

/*
    rock -> scissors, scorch
    paper -> rock, shatter
    scissors -> paper, scald
    scorch -> paper, scissors
    surge -> rock, paper
    shock -> rock, scissors
*/
const Types = {
    "Rock": new Rock(),
    "Paper": new Paper(),
    "Scissors": new Scissors(),
};
const TypeList = Object.keys(Types);

export { Types, TypeList };