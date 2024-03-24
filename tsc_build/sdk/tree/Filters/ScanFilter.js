import { Filter } from './Filter';
import { FilterList } from '../../Filtering/Filtering';
import { defaultFilterForScanning } from '../../Filtering/DefaultFilterForScanning';
export class ScanFilter extends Filter {
    constructor(filterName) {
        super();
        this.filter = new FilterList();
        this.filter.load(defaultFilterForScanning);
    }
    evaluate(node) {
        return this.filter.include(node.getPath());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NhbkZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvdHJlZS9GaWx0ZXJzL1NjYW5GaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxFQUNMLHdCQUF3QixFQUN6QixNQUFNLDBDQUEwQyxDQUFDO0FBRWxELE1BQU0sT0FBTyxVQUFXLFNBQVEsTUFBTTtJQUlwQyxZQUFtQixVQUFrQjtRQUNuQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFFTSxRQUFRLENBQUMsSUFBVTtRQUN4QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FFRiJ9