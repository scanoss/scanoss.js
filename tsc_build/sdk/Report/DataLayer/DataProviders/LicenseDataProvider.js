export class LicenseDataProvider {
    constructor(scanResults, dependencies) {
        this.scanResults = scanResults;
        this.dependencies = dependencies;
        //Maps a license name to its own data
        this.licenseStorage = {};
        this.licenseLayer = [];
    }
    getLayerName() {
        return this.constructor.name;
    }
    async getData() {
        this.componentList = Object.values(this.scanResults).flat();
        this.componentList = this.componentList.filter((component) => component.id !== 'none');
        if (this.componentList.length > 0)
            this.updateLicenseStorageFromComponentList();
        if (this.dependencies && this.dependencies.filesList.length > 0)
            this.updateLicenseStorageFromDependencies();
        this.licenseLayer = Object.values(this.licenseStorage);
        this.licenseLayer.sort((itemA, itemB) => {
            if (itemA.value > itemB.value)
                return -1;
            else if (itemA.value < itemB.value)
                return 1;
            return 0;
        });
        return { licenses: this.licenseLayer };
    }
    //Gets all license from the result of scan and stores in this.licenseStorage map
    updateLicenseStorageFromComponentList() {
        this.componentList.forEach((component) => {
            component.licenses.forEach((license) => {
                const newLicenseComponent = {};
                newLicenseComponent.purl = component.purl[0];
                newLicenseComponent.vendor = component.vendor;
                newLicenseComponent.versions = [component.version];
                newLicenseComponent.name = component.component;
                newLicenseComponent.url = component.url;
                const licenseExist = !!this.licenseStorage[license.name];
                if (!licenseExist) {
                    const newLicense = {};
                    newLicense.value = 1;
                    newLicense.label = license.name;
                    newLicense.components = [newLicenseComponent];
                    this.licenseStorage[license.name] = newLicense;
                }
                else {
                    this.licenseStorage[license.name] = this.insertComponentIntoLicense(this.licenseStorage[license.name], newLicenseComponent);
                }
            });
        });
    }
    //Gets all licenses from results of dependency analysis
    updateLicenseStorageFromDependencies() {
        this.dependencies.filesList.forEach((file) => {
            file.dependenciesList.forEach((dependency) => {
                dependency.licensesList.forEach((license) => {
                    const newLicenseComponent = {};
                    newLicenseComponent.purl = dependency.purl;
                    newLicenseComponent.versions = [dependency.version];
                    newLicenseComponent.name = dependency.component;
                    newLicenseComponent.vendor = null;
                    newLicenseComponent.url = null;
                    if (license.spdxId !== '') {
                        license.spdxId.split(/;|\//g).forEach((license_name) => {
                            const licenseExist = !!this.licenseStorage[license_name];
                            if (!licenseExist) {
                                const newLicense = {};
                                newLicense.value = 1;
                                newLicense.label = license_name;
                                newLicense.components = [newLicenseComponent];
                                this.licenseStorage[license_name] = newLicense;
                            }
                            else {
                                this.licenseStorage[license_name] =
                                    this.insertComponentIntoLicense(this.licenseStorage[license_name], newLicenseComponent);
                            }
                        });
                    }
                    else {
                        // Unknown license
                        const licenseExist = !!this.licenseStorage['unknown'];
                        if (!licenseExist) {
                            const newLicense = {};
                            newLicense.value = 1;
                            newLicense.label = 'unknown';
                            newLicense.components = [newLicenseComponent];
                            this.licenseStorage['unknown'] = newLicense;
                        }
                        else {
                            this.licenseStorage['unknown'] = this.insertComponentIntoLicense(this.licenseStorage['unknown'], newLicenseComponent);
                        }
                    }
                });
            });
        });
    }
    insertComponentIntoLicense(license, newComponent) {
        const componentIndex = license.components.findIndex((c) => c.purl === newComponent.purl);
        if (componentIndex >= 0) {
            //if newComponent exist in license
            const versionExist = !!license.components[componentIndex].versions.find((version) => version === newComponent.versions[0]);
            if (!versionExist) {
                license.components[componentIndex].versions.push(newComponent.versions[0]);
                license.value++;
            }
        }
        else {
            license.components.push(newComponent);
            license.value++;
        }
        return license;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGljZW5zZURhdGFQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvUmVwb3J0L0RhdGFMYXllci9EYXRhUHJvdmlkZXJzL0xpY2Vuc2VEYXRhUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUEsTUFBTSxPQUFPLG1CQUFtQjtJQVc5QixZQUFZLFdBQTJCLEVBQUUsWUFBa0M7UUFDekUsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFFakMscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxZQUFZO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUFPO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FDNUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUN2QyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQy9CLElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDO1FBRS9DLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUM3RCxJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztRQUU5QyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FB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