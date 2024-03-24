export class LicenseObligationDataProvider {
    constructor(scanResults, dependencies) {
        this.scanResults = scanResults;
        this.dependencies = dependencies;
        //Maps a license name to its own data
        this.licenseSet = {};
        this.licenseLayer = [];
    }
    getLayerName() {
        return 'License Obligation Layer';
    }
    async getData() {
        /* Get licenses from Scan Results */
        this.componentList = Object.values(this.scanResults).flat();
        this.componentList = this.componentList.filter((component) => component.id !== 'none');
        if (this.componentList.length > 0) {
            this.componentList.forEach((component) => {
                component.licenses.forEach((license) => {
                    if (!this.licenseSet[license.name]) {
                        this.licenseSet[license.name] = {
                            copyleft: license.copyleft?.toLowerCase() === 'yes' ? true : false,
                            label: license.name,
                            hasIncompatibles: [],
                            incompatibleWith: license.incompatible_with
                                ? license.incompatible_with.split('')
                                : [],
                        };
                    }
                });
            });
        }
        /* Get licenses from Dependencies Results */
        if (this.dependencies && this.dependencies.filesList.length > 0) {
            this.dependencies.filesList.forEach((file) => {
                file.dependenciesList.forEach((dependency) => {
                    dependency.licensesList.forEach((license) => {
                        license.spdxId?.split(/;|\//g).forEach((spdxid) => {
                            if (spdxid !== '' && !this.licenseSet[spdxid]) {
                                this.licenseSet[spdxid] = {
                                    copyleft: false,
                                    label: spdxid,
                                    hasIncompatibles: [],
                                    incompatibleWith: [],
                                };
                            }
                        });
                    });
                });
            });
        }
        const allSpdxid = Object.keys(this.licenseSet);
        const allLicenses = Object.values(this.licenseSet);
        const licensesObligations = allLicenses.map((l) => {
            l.incompatibleWith = l.incompatibleWith.filter((spdxid) => allSpdxid.includes(spdxid));
            return l;
        });
        return { licensesObligations };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGljZW5zZU9ibGlnYXRpb25EYXRhUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL1JlcG9ydC9EYXRhTGF5ZXIvRGF0YVByb3ZpZGVycy9MaWNlbnNlT2JsaWdhdGlvbkRhdGFQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFhQSxNQUFNLE9BQU8sNkJBQTZCO0lBUXhDLFlBQVksV0FBMkIsRUFBRSxZQUFrQztRQUN6RSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUVqQyxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVNLFlBQVk7UUFDakIsT0FBTywwQkFBMEIsQ0FBQztJQUNwQyxDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU87UUFDbEIsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FDNUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUN2QyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDdkMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRzs0QkFDOUIsUUFBUSxFQUNOLE9BQU8sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7NEJBQzFELEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSTs0QkFDbkIsZ0JBQWdCLEVBQUUsRUFBRTs0QkFDcEIsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjtnQ0FDekMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dDQUNyQyxDQUFDLENBQUMsRUFBRTt5QkFDUCxDQUFDO3FCQUNIO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELDRDQUE0QztRQUM1QyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUMzQyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUMxQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTs0QkFDaEQsSUFBSSxNQUFNLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQ0FDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRztvQ0FDeEIsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsS0FBSyxFQUFFLE1BQU07b0NBQ2IsZ0JBQWdCLEVBQUUsRUFBRTtvQ0FDcEIsZ0JBQWdCLEVBQUUsRUFBRTtpQ0FDckIsQ0FBQzs2QkFDSDt3QkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVuRCxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRCxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ3hELFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQzNCLENBQUM7WUFDRixPQUFPLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxFQUFFLG1CQUFtQixFQUFpQixDQUFDO0lBQ2hELENBQUM7Q0FDRiJ9