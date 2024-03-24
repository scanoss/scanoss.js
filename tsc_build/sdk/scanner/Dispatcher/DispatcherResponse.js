export class DispatcherResponse {
    constructor(serverResponse, wfpContent) {
        this.serverResponse = serverResponse;
        this.wfpContent = wfpContent;
        this.filesScanned = Object.keys(this.serverResponse);
        // this.verifyResponse();
    }
    getServerResponse() {
        return this.serverResponse;
    }
    getWfpContent() {
        return this.wfpContent;
    }
    matchRegex(str, re = /file=/g) {
        return ((str || '').match(re) || []).length;
    }
    verifyResponse() {
        const wfpNumFiles = this.matchRegex(this.wfpContent, /file=/g);
        const serverResponseNumFiles = Object.keys(this.serverResponse).length;
        if (wfpNumFiles !== serverResponseNumFiles)
            throw new Error(`The numbers of files in the wfp sended does not match with the server response`);
    }
    getFilesScanned() {
        return this.filesScanned;
    }
    getNumberOfFilesScanned() {
        return this.filesScanned.length;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGF0Y2hlclJlc3BvbnNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Nkay9zY2FubmVyL0Rpc3BhdGNoZXIvRGlzcGF0Y2hlclJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sT0FBTyxrQkFBa0I7SUFPN0IsWUFBWSxjQUFjLEVBQUUsVUFBVTtRQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JELHlCQUF5QjtJQUMzQixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQzdCLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxRQUFRO1FBQzNCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzlDLENBQUM7SUFFRCxjQUFjO1FBQ1osTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3ZFLElBQUksV0FBVyxLQUFLLHNCQUFzQjtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztJQUNoSixDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRUQsdUJBQXVCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDbEMsQ0FBQztDQUNGIn0=