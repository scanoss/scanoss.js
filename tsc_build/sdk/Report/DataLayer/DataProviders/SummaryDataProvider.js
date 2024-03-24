import { ScannerComponentId, } from '../../../scanner/ScannerTypes';
export class SummaryDataProvider {
    constructor(projectName, projectCreatedAt, scannerResults) {
        this.reportTitle = 'Detected Report';
        this.scannerResults = scannerResults;
        this.projectName = projectName;
        this.projectCreateAt = projectCreatedAt;
        this.summary = {};
    }
    getLayerName() {
        return this.constructor.name;
    }
    async getData() {
        this.summary.projectName = this.projectName;
        this.summary.timestamp = this.projectCreateAt;
        this.summary.totalFiles = 0;
        this.summary.noMatchFiles = 0;
        this.summary.matchedFiles = 0;
        this.summary.reportTitle = this.getReportTitle();
        for (const [file, components] of Object.entries(this.scannerResults)) {
            components.forEach((component) => {
                if (component.id == ScannerComponentId.NONE)
                    this.summary.noMatchFiles++;
                else
                    this.summary.matchedFiles++;
                this.summary.totalFiles++;
            });
        }
        return { summary: this.summary };
    }
    getReportTitle() {
        return this.reportTitle;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VtbWFyeURhdGFQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvUmVwb3J0L0RhdGFMYXllci9EYXRhUHJvdmlkZXJzL1N1bW1hcnlEYXRhUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUVMLGtCQUFrQixHQUVuQixNQUFNLCtCQUErQixDQUFDO0FBRXZDLE1BQU0sT0FBTyxtQkFBbUI7SUFVOUIsWUFDRSxXQUFtQixFQUNuQixnQkFBc0IsRUFDdEIsY0FBOEI7UUFKeEIsZ0JBQVcsR0FBVyxpQkFBaUIsQ0FBQztRQU05QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQXFCLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRU0sWUFBWTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTztRQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRWpELEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNwRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQy9CLElBQUksU0FBUyxDQUFDLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJO29CQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDOztvQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBb0IsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2hELENBQUM7SUFFTSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0NBQ0YifQ==