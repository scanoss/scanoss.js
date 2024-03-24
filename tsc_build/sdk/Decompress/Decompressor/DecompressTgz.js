import { Decompressor } from './Decompressor';
import tar from 'tar';
export class DecompressTgz extends Decompressor {
    constructor() {
        super();
        this.supportedFormats = [
            ".tar.gz",
            ".tgz",
            ".tar",
        ];
    }
    async run(archivePath, destPath) {
        return tar.x({ C: destPath, file: archivePath });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb21wcmVzc1Rnei5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvRGVjb21wcmVzcy9EZWNvbXByZXNzb3IvRGVjb21wcmVzc1Rnei50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBRXRCLE1BQU0sT0FBTyxhQUFjLFNBQVEsWUFBWTtJQUU3QztRQUNFLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLGdCQUFnQixHQUFHO1lBQ3RCLFNBQVM7WUFDVCxNQUFNO1lBQ04sTUFBTTtTQUNQLENBQUE7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFtQixFQUFFLFFBQWdCO1FBQ2xELE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUVGIn0=