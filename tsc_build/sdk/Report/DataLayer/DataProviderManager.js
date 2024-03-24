export class DataProviderManager {
    constructor() {
        this.dataLayersProviders = [];
    }
    addDataProvider(l) {
        this.dataLayersProviders.push(l);
    }
    async generateData() {
        let dataLayer = {
            component: null,
            dependencies: null,
            vulnerabilities: null,
            summary: null,
            licenses: null,
            licensesObligations: null,
        };
        for (const layer of this.dataLayersProviders)
            Object.assign(dataLayer, await layer.getData());
        return dataLayer;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YVByb3ZpZGVyTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvUmVwb3J0L0RhdGFMYXllci9EYXRhUHJvdmlkZXJNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sT0FBTyxtQkFBbUI7SUFHOUI7UUFDRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFTSxlQUFlLENBQUMsQ0FBZTtRQUNwQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTSxLQUFLLENBQUMsWUFBWTtRQUN2QixJQUFJLFNBQVMsR0FBZ0I7WUFDM0IsU0FBUyxFQUFFLElBQUk7WUFDZixZQUFZLEVBQUUsSUFBSTtZQUNsQixlQUFlLEVBQUUsSUFBSTtZQUNyQixPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxJQUFJO1lBQ2QsbUJBQW1CLEVBQUUsSUFBSTtTQUMxQixDQUFDO1FBRUYsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsbUJBQW1CO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDbEQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztDQUNGIn0=