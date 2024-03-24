import { Filter } from './Filter';
import { FilterList } from '../../Filtering/Filtering';
import { defaultFilterForDependencies } from '../../Filtering/DefaultFilterForDependencies';
export class DependencyFilter extends Filter {
    constructor(filterName) {
        super();
        this.filter = new FilterList();
        this.filter.load(defaultFilterForDependencies);
    }
    evaluate(node) {
        return this.filter.include(node.getPath());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwZW5kZW5jeUZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvdHJlZS9GaWx0ZXJzL0RlcGVuZGVuY3lGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxPQUFPLEVBQUUsVUFBVSxFQUFVLE1BQU0sMkJBQTJCLENBQUM7QUFDL0QsT0FBTyxFQUNMLDRCQUE0QixFQUM3QixNQUFNLDhDQUE4QyxDQUFDO0FBRXRELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxNQUFNO0lBSTFDLFlBQW1CLFVBQWtCO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUE7SUFDaEQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxJQUFVO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUVGIn0=