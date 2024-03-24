import { v4 as uuidv4 } from 'uuid';
import path from 'path';
export class FingerprintPackage {
    constructor(wfpContent, scanRoot = '') {
        this.wfpContent = wfpContent;
        this.scanRoot = scanRoot;
        this.obfuscateMap = null;
    }
    isEqual(fingerprintPackage) {
        return this.getContent() === fingerprintPackage.getContent();
    }
    getContent() {
        return this.wfpContent;
    }
    setContent(wfp) {
        this.wfpContent = wfp;
    }
    getNumberFilesFingerprinted() {
        const match = this.getContent().match(/file=/g);
        if (!match)
            return 0;
        return match.length;
    }
    getFilesFingerprinted() {
        const filePaths = [];
        const regex = new RegExp(/file=.*,.*,(?<filePath>.*)/g);
        let match;
        while ((match = regex.exec(this.getContent())) !== null) {
            if (match.groups) {
                let filePath = match.groups.filePath;
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }
    isObfuscated() {
        if (!this.obfuscateMap)
            return false;
        return true;
    }
    getObfuscationMap() {
        return this.obfuscateMap;
    }
    obfuscate() {
        let regex = /(file=.*,.*),(.*)/g;
        this.obfuscateMap = {};
        let output = this.getContent().replace(regex, (_, match, originalPath) => {
            const uuid = uuidv4().replace(/-/g, '');
            const ext = path.extname(originalPath);
            this.obfuscateMap[uuid + ext] = originalPath;
            const newPath = uuid + ext;
            return `${match},${newPath}`;
        });
        this.setContent(output);
        return this.obfuscateMap;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmluZ2VycHJpbnRQYWNrYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Nkay9zY2FubmVyL1dmcFByb3ZpZGVyL0ZpbmdlcnByaW50UGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFHeEIsTUFBTSxPQUFPLGtCQUFrQjtJQU83QixZQUFZLFVBQWtCLEVBQUUsUUFBUSxHQUFHLEVBQUU7UUFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVNLE9BQU8sQ0FBQyxrQkFBc0M7UUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDL0QsQ0FBQztJQUVNLFVBQVU7UUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxHQUFHO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLENBQUM7SUFFTSwyQkFBMkI7UUFDaEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFHLENBQUMsS0FBSztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRU0scUJBQXFCO1FBQzFCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRXhELElBQUksS0FBSyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3ZELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3JDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDMUI7U0FDRjtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFTSxZQUFZO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVNLGlCQUFpQjtRQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVNLFNBQVM7UUFDZCxJQUFJLEtBQUssR0FBRyxvQkFBb0IsQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUV2QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUU7WUFDdkUsTUFBTSxJQUFJLEdBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXZDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQzNCLE9BQU8sR0FBRyxLQUFLLElBQUksT0FBTyxFQUFFLENBQUE7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0NBRUYifQ==