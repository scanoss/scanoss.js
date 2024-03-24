export class DependencyDataProvider {
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    getLayerName() {
        return this.constructor.name;
    }
    async getData() {
        const dependencyLayer = { dependencies: null };
        if (!this.dependencies)
            return dependencyLayer;
        const parsedDepLayer = this.parseDependencyData(this.dependencies);
        dependencyLayer.dependencies = parsedDepLayer;
        if (!dependencyLayer.dependencies.length)
            dependencyLayer.dependencies = null;
        return dependencyLayer;
    }
    parseDependencyData(dependencies) {
        const dependencyLayer = [];
        dependencies.filesList.forEach((file) => {
            const newDependencies = [];
            file.dependenciesList.forEach((dependency) => {
                const newLicenses = [];
                dependency.licensesList.forEach((license) => {
                    newLicenses.push({ name: license.name, spdxid: license.spdxId });
                });
                newDependencies.push({
                    purl: dependency.purl,
                    licenses: newLicenses,
                    version: dependency.version,
                    component: dependency.component,
                });
            });
            dependencyLayer.push({ file: file.file, dependencies: newDependencies });
        });
        return dependencyLayer;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwZW5kZW5jeURhdGFQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvUmVwb3J0L0RhdGFMYXllci9EYXRhUHJvdmlkZXJzL0RlcGVuZGVuY3lEYXRhUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsTUFBTSxPQUFPLHNCQUFzQjtJQUdqQyxZQUFZLFlBQWlDO1FBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFFTSxZQUFZO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUFPO1FBQ2xCLE1BQU0sZUFBZSxHQUFnQixFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLGVBQWUsQ0FBQztRQUMvQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25FLGVBQWUsQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDO1FBQzlDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLE1BQU07WUFDdEMsZUFBZSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFdEMsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVNLG1CQUFtQixDQUN4QixZQUFpQztRQUVqQyxNQUFNLGVBQWUsR0FBK0IsRUFBRSxDQUFDO1FBRXZELFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDdEMsTUFBTSxlQUFlLEdBQXNCLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQzNDLE1BQU0sV0FBVyxHQUFtQixFQUFFLENBQUM7Z0JBQ3ZDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQyxDQUFDO2dCQUNILGVBQWUsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtvQkFDckIsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTztvQkFDM0IsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO2lCQUNoQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7Q0FDRiJ9