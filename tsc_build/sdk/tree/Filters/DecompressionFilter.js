import { Filter } from './Filter';
import { NodeType } from '../Node';
import { DecompressionManager } from '../../Decompress/DecompressionManager';
export class DecompressionFilter extends Filter {
    constructor(filterName) {
        super();
        this.supportedFileExtension = new DecompressionManager().getSupportedFormats();
    }
    //Returns true if you want the file
    evaluate(node) {
        if (node.getType() == NodeType.FOLDER)
            return true;
        if (this.supportedFileExtension.some(supportedFormat => node.getName().endsWith(supportedFormat)))
            return true;
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb21wcmVzc2lvbkZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvdHJlZS9GaWx0ZXJzL0RlY29tcHJlc3Npb25GaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRzdFLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxNQUFNO0lBSTdDLFlBQW1CLFVBQWtCO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ2pGLENBQUM7SUFFRCxtQ0FBbUM7SUFDNUIsUUFBUSxDQUFDLElBQVU7UUFDeEIsSUFBRyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDL0csT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBRUYifQ==