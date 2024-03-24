export class ComponentDataProvider {
    constructor(scanRawResults, dependencies) {
        this.scanRawResults = scanRawResults;
        this.dependencies = dependencies;
    }
    getLayerName() {
        return this.constructor.name;
    }
    async getData() {
        const componentLayer = { component: null };
        if (!this.scanRawResults && !this.dependencies)
            return componentLayer;
        //Extract all components from scanRawResults, does not matter if there are duplicated
        //And removes all no match results.
        this.componentList = Object.values(this.scanRawResults).flat();
        this.componentList = this.componentList.filter((component) => component.id !== 'none');
        const scannerComponentLayer = this.parseComponentsFromScanner(this.componentList);
        const dependenciesComponentLayer = this.parseComponentsFromDependencies(this.dependencies);
        componentLayer.component = [
            ...scannerComponentLayer,
            ...dependenciesComponentLayer,
        ].sort((itemA, itemB) => {
            if (itemA.name < itemB.name)
                return -1;
            else if (itemA.name > itemB.name)
                return 1;
            return 0;
        });
        if (!componentLayer.component.length)
            componentLayer.component = null;
        return componentLayer;
    }
    parseComponentsFromDependencies(dependencies) {
        const componentLayer = [];
        if (!dependencies)
            return componentLayer;
        dependencies.filesList.forEach((file) => {
            file.dependenciesList.forEach((dependency) => {
                const newComponent = {};
                newComponent.key = dependency.purl;
                newComponent.purls = [dependency.purl];
                newComponent.name = dependency.component;
                newComponent.url = null;
                newComponent.vendor = null;
                newComponent.health = null;
                newComponent.versions = [
                    {
                        version: dependency.version,
                        licenses: dependency.licensesList.map((license) => license.spdxId),
                        copyrights: null,
                        cryptography: null,
                        quality: null,
                    },
                ];
                const existingComponent = componentLayer.find((component) => component.key === newComponent.key);
                if (existingComponent) {
                    const existingVersion = existingComponent.versions.find((version) => version.version === newComponent.versions[0].version);
                    if (!existingVersion)
                        existingComponent.versions.push({
                            version: newComponent.versions[0].version,
                            licenses: newComponent.versions[0].licenses,
                            copyrights: newComponent.versions[0].copyrights,
                            quality: null,
                            cryptography: null,
                        });
                }
                else {
                    //Component does not exist, insert as it is.
                    componentLayer.push(newComponent);
                }
            });
        });
        return componentLayer;
    }
    parseComponentsFromScanner(scanComponents) {
        const componentLayer = [];
        if (!scanComponents)
            return componentLayer;
        for (let i = 0; i < scanComponents.length; i++) {
            try {
                // qualityValue would have a number from 0 to 5 or undefined.
                const qualityValue = Number(scanComponents[i]?.quality?.shift()?.score?.split('/').shift());
                //Generates a new component
                const newComponent = {
                    key: scanComponents[i].purl[0],
                    purls: scanComponents[i].purl,
                    name: scanComponents[i].component,
                    url: scanComponents[i].url,
                    vendor: scanComponents[i].vendor,
                    health: scanComponents[i].health,
                    versions: [
                        {
                            version: scanComponents[i].version,
                            licenses: scanComponents[i].licenses.map((license) => license.name),
                            copyrights: scanComponents[i].copyrights,
                            quality: { sum: 0, scoreAvg: 0, count: 0 },
                            cryptography: scanComponents[i]?.cryptography,
                        },
                    ],
                };
                //Removes duplicated licenses
                newComponent.versions[0].licenses = [
                    ...new Set(newComponent.versions[0].licenses),
                ];
                if (qualityValue) {
                    newComponent.versions[0].quality.count = 1;
                    newComponent.versions[0].quality.sum = qualityValue;
                    newComponent.versions[0].quality.scoreAvg = qualityValue;
                }
                //Merge new component in componentList
                const componentTarget = componentLayer.find((component) => component.key === newComponent.key);
                if (componentTarget) {
                    const versionTarget = componentTarget.versions.find((item) => item.version === newComponent.versions[0].version);
                    if (versionTarget) {
                        //Insert licenses
                        newComponent.versions[0].licenses.forEach((licence) => {
                            if (!versionTarget.licenses.includes(licence))
                                versionTarget.licenses.push(licence);
                        });
                        //Insert copyright
                        newComponent.versions[0]?.copyrights?.forEach((newCopyright) => {
                            if (versionTarget.copyrights.every((copyright) => newCopyright.name != copyright.name)) {
                                versionTarget.copyrights.push(newCopyright);
                            }
                        });
                        //Insert cryptography
                        newComponent.versions[0]?.cryptography?.forEach((newCryptoAlgo) => {
                            if (versionTarget.cryptography.every((cryptoAlgorithm) => cryptoAlgorithm.algorithm != newCryptoAlgo.algorithm)) {
                                versionTarget.cryptography.push(newCryptoAlgo);
                            }
                        });
                        //recalculate quality average in case we have a quality value
                        if (qualityValue) {
                            versionTarget.quality.count++;
                            versionTarget.quality.sum += Number(qualityValue);
                            versionTarget.quality.scoreAvg =
                                versionTarget.quality.sum / versionTarget.quality.count;
                        }
                    }
                    else {
                        //newComponent version is not included in the component with same purl key
                        componentTarget.versions = componentTarget.versions.concat(newComponent.versions);
                    }
                }
                else
                    componentLayer.push(newComponent);
            }
            catch (e) {
                console.error(`Problem inserting new component building Component Data Layer - `, e);
            }
        }
        //Replace [] for null in versions
        for (let i = 0; i < componentLayer.length; i++) {
            if (!componentLayer[i].health)
                componentLayer[i].health = null;
            componentLayer[i].versions.forEach((version) => {
                if (version.copyrights?.length == 0)
                    version.copyrights = null;
                if (version.licenses?.length == 0)
                    version.licenses = null;
                if (version.cryptography?.length === 0)
                    version.cryptography = null;
                if (version.quality.count === 0)
                    version.quality = null;
            });
        }
        return componentLayer;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9uZW50RGF0YVByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Nkay9SZXBvcnQvRGF0YUxheWVyL0RhdGFQcm92aWRlcnMvQ29tcG9uZW50RGF0YVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLE1BQU0sT0FBTyxxQkFBcUI7SUFPaEMsWUFDRSxjQUE4QixFQUM5QixZQUFrQztRQUVsQyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNuQyxDQUFDO0lBRU0sWUFBWTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTztRQUNsQixNQUFNLGNBQWMsR0FBZ0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFFeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtZQUFFLE9BQU8sY0FBYyxDQUFDO1FBRXRFLHFGQUFxRjtRQUNyRixtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUM1QyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQ3ZDLENBQUM7UUFDRixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FDM0QsSUFBSSxDQUFDLGFBQWEsQ0FDbkIsQ0FBQztRQUNGLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUNyRSxJQUFJLENBQUMsWUFBWSxDQUNsQixDQUFDO1FBRUYs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