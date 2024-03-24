export default class Node {
    constructor(path, label) {
        this.path = path;
        this.label = label;
    }
    getName() {
        return this.label;
    }
    getPath() {
        return this.path;
    }
    getType() {
        return this.type;
    }
}
export var NodeType;
(function (NodeType) {
    NodeType["FOLDER"] = "FOLDER";
    NodeType["FILE"] = "FILE";
})(NodeType || (NodeType = {}));
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZGsvdHJlZS9Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sQ0FBQyxPQUFPLE9BQWdCLElBQUk7SUFTaEMsWUFBWSxJQUFZLEVBQUUsS0FBYTtRQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBTU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0NBRUY7QUFFRCxNQUFNLENBQU4sSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2xCLDZCQUFpQixDQUFBO0lBQ2pCLHlCQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsUUFBUSxLQUFSLFFBQVEsUUFHbkI7QUFBQSxDQUFDIn0=