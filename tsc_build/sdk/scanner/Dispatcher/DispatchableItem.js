import FormData from 'form-data';
export class DispatchableItem {
    constructor() {
        this.errorCounter = 0;
        this.form = new FormData();
    }
    get uuid() {
        return this._uuid;
    }
    set uuid(uuid) {
        this._uuid = uuid;
    }
    getForm() {
        this.form = new FormData();
        this.form.append('file', Buffer.from(this.fingerprintPackage.getContent()), 'data.wfp');
        if (this.engineFlags)
            this.form.append('flags', this.engineFlags);
        if (this.sbomMode && this.sbom) {
            this.form.append('assets', this.sbom);
            this.form.append('type', this.sbomMode);
        }
        return this.form;
    }
    increaseErrorCounter() {
        this.errorCounter += 1;
    }
    getErrorCounter() {
        return this.errorCounter;
    }
    setFingerprintPackage(fingerprintPackage) {
        this.fingerprintPackage = fingerprintPackage;
    }
    getFingerprintPackage() {
        return this.fingerprintPackage;
    }
    setEngineFlags(engineFlags) {
        this.engineFlags = engineFlags;
    }
    setSbom(sbom, sbomMode) {
        this.sbom = sbom;
        this.sbomMode = sbomMode;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGF0Y2hhYmxlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9EaXNwYXRjaGVyL0Rpc3BhdGNoYWJsZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBR2pDLE1BQU0sT0FBTyxnQkFBZ0I7SUFhM0I7UUFDRSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUlELElBQVcsSUFBSTtRQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsSUFBVyxJQUFJLENBQUMsSUFBWTtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRU0sT0FBTztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDZCxNQUFNLEVBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFDakQsVUFBVSxDQUNYLENBQUM7UUFDRixJQUFJLElBQUksQ0FBQyxXQUFXO1lBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVsRSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekM7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVNLG9CQUFvQjtRQUN6QixJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRU0sZUFBZTtRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVNLHFCQUFxQixDQUFDLGtCQUFzQztRQUNqRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7SUFDL0MsQ0FBQztJQUVNLHFCQUFxQjtRQUMxQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxPQUFPLENBQUMsSUFBWSxFQUFFLFFBQWtCO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7Q0FDRiJ9