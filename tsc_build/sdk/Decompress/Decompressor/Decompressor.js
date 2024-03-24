export class Decompressor {
    isSupported(filename) {
        if (this.supportedFormats.some((format) => filename.endsWith(format)))
            return true;
        return false;
    }
    /**
     * Returns the extension supported by this decompressor
     * Includes the '.' appended
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb21wcmVzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Nkay9EZWNvbXByZXNzL0RlY29tcHJlc3Nvci9EZWNvbXByZXNzb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFnQixZQUFZO0lBS3pCLFdBQVcsQ0FBQyxRQUFnQjtRQUNqQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNuRixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFHRDs7O09BR0c7SUFDSSxtQkFBbUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDL0IsQ0FBQztDQUVGIn0=