import { NodeType } from "./Node";
import Node from './Node';
export default class Folder extends Node {
    constructor(path, label) {
        super(path, label);
        this.type = NodeType.FOLDER;
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
    }
    getChildren() {
        return this.children;
    }
    getNode(path) {
        if (!this.checkMyPath(path))
            return null;
        if (path === this.getPath())
            return this;
        for (const child of this.children) {
            const node = child.getNode(path);
            if (node !== null)
                return node;
        }
        return null;
    }
    // Returns true only if my path is contained in the path (parameter)
    checkMyPath(path) {
        if (!path.includes(this.getPath()))
            return false;
        // Only if first filter is passed.
        const myPathExploded = this.getPath().split('/');
        const pathExploded = path.split('/');
        for (let i = 0; i < myPathExploded.length; i += 1) {
            if (myPathExploded[i] !== pathExploded[i])
                return false;
        }
        return true;
    }
    getFiles(f) {
        if (f && !f.evaluate(this))
            return [];
        const files = [];
        this.children.forEach((child) => {
            files.push(...child.getFiles(f));
        });
        return files;
    }
    removeChildren() {
        this.children = [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9sZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nkay90cmVlL0ZvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUcxQixNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU8sU0FBUSxJQUFJO0lBR3RDLFlBQVksSUFBWSxFQUFFLEtBQWE7UUFDckMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVNLFFBQVEsQ0FBQyxJQUFVO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxXQUFXO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRU0sT0FBTyxDQUFDLElBQVk7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDekMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3pDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLElBQUksSUFBSSxLQUFLLElBQUk7Z0JBQUUsT0FBTyxJQUFJLENBQUM7U0FDaEM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxvRUFBb0U7SUFDNUQsV0FBVyxDQUFDLElBQVk7UUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDakQsa0NBQWtDO1FBQ2xDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pELElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7U0FDekQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSxRQUFRLENBQUMsQ0FBVTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFdEMsTUFBTSxLQUFLLEdBQWtCLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTSxjQUFjO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7Q0FDRiJ9