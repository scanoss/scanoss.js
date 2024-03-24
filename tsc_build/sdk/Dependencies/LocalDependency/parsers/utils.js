import { URL } from "url";
export function isValidUrl(string) {
    let url;
    try {
        new URL(string);
    }
    catch (_) {
        return false;
    }
    return true;
}
export function isValidPath(string) {
    return /^((?:\.\.?)|(?:[a-zA-Z]:\\)|(?:\/))/gm.test(string);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9Mb2NhbERlcGVuZGVuY3kvcGFyc2Vycy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRTFCLE1BQU0sVUFBVSxVQUFVLENBQUMsTUFBYztJQUNyQyxJQUFJLEdBQVEsQ0FBQztJQUNiLElBQUk7UUFDRixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVILE1BQU0sVUFBVSxXQUFXLENBQUMsTUFBYztJQUN4QyxPQUFPLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5RCxDQUFDIn0=