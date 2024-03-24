import pathLib from 'path';
import fs from 'fs';
// Async function that verify if a path is a folder. If the path is not valid the promise will be rejected
export const isFolder = (path) => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stats.isDirectory());
            }
        });
    });
};
export function getProjectNameFromPath(path) {
    return pathLib.basename(path, pathLib.extname(path));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tbWFuZHMvaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxNQUFNLENBQUM7QUFDM0IsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXBCLDBHQUEwRztBQUMxRyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFZLEVBQW9CLEVBQUU7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUMzQixJQUFJLEdBQUcsRUFBRTtnQkFDUCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDYjtpQkFBTTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7YUFDOUI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUFDLElBQVk7SUFDakQsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDckQsQ0FBQyJ9