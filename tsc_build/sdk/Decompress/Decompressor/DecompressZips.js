import { Decompressor } from './Decompressor';
import AdmZip from 'adm-zip';
export class DecompressZip extends Decompressor {
    constructor() {
        super();
        this.supportedFormats = [
            ".zip",
            ".jar",
            ".ear",
            ".war"
        ];
    }
    async run(archivePath, destPath) {
        const zip = new AdmZip(archivePath);
        zip.extractAllTo(destPath);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb21wcmVzc1ppcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL0RlY29tcHJlc3MvRGVjb21wcmVzc29yL0RlY29tcHJlc3NaaXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFFN0IsTUFBTSxPQUFPLGFBQWMsU0FBUSxZQUFZO0lBRTdDO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsZ0JBQWdCLEdBQUc7WUFDdEIsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtTQUNQLENBQUE7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFtQixFQUFFLFFBQWdCO1FBQ3BELE1BQU0sR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUVGIn0=