import * as grpc from '@grpc/grpc-js';
import { DependenciesClient } from './scanoss/api/dependencies/v2/scanoss-dependencies_grpc_pb';
import * as DependenciesMessages from './scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
export class DependencyService {
    constructor(endpoint, proxy) {
        if (proxy)
            process.env.grpc_proxy = proxy;
        this.client = new DependenciesClient(endpoint, grpc.credentials.createSsl());
    }
    async get(req) {
        return new Promise((resolve, reject) => {
            this.client.getDependencies(req, (err, response) => {
                if (err)
                    reject(err);
                resolve(response);
            });
        });
    }
    buildDependencyRequestMsg(plainObj) {
        try {
            const depMessage = new DependenciesMessages.DependencyRequest();
            for (const dependency of plainObj.filesList) {
                const fileMsg = new DependenciesMessages.DependencyRequest.Files();
                fileMsg.setFile(dependency.file);
                for (const purl of dependency.purlsList) {
                    const purlMsg = new DependenciesMessages.DependencyRequest.Purls();
                    purlMsg.setPurl(purl.purl);
                    purlMsg.setRequirement(purl?.requirement);
                    fileMsg.addPurls(purlMsg);
                }
                depMessage.addFiles(fileMsg);
            }
            return depMessage;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async echo(req) {
        return new Promise((resolve, reject) => {
            this.client.echo(req, (err, response) => {
                if (err)
                    reject(err);
                resolve(response);
            });
        });
    }
    buildEchoRequestMsg(plainObj) {
        try {
            const echoMessage = new CommonMessages.EchoRequest();
            echoMessage.setMessage(plainObj.message);
            return echoMessage;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwZW5kZW5jeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL1NlcnZpY2VzL0dycGMvRGVwZW5kZW5jeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxlQUFlLENBQUM7QUFDdEMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFDaEcsT0FBTyxLQUFLLG9CQUFvQixNQUFNLHVEQUF1RCxDQUFDO0FBQzlGLE9BQU8sS0FBSyxjQUFjLE1BQU0sMkNBQTJDLENBQUM7QUFHNUUsTUFBTSxPQUFPLGlCQUFpQjtJQUs1QixZQUFZLFFBQWdCLEVBQUUsS0FBYztRQUMxQyxJQUFJLEtBQUs7WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGtCQUFrQixDQUNsQyxRQUFRLEVBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FDN0IsQ0FBQztJQUNKLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUNkLEdBQTJDO1FBRTNDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLEdBQUc7b0JBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSx5QkFBeUIsQ0FDOUIsUUFBeUQ7UUFFekQsSUFBSTtZQUNGLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQW9CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNoRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ25FLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUU7b0JBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ25FLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMzQixPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDM0I7Z0JBQ0QsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM5QjtZQUNELE9BQU8sVUFBVSxDQUFDO1NBQ25CO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FDZixHQUErQjtRQUUvQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxHQUFHO29CQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sbUJBQW1CLENBQ3hCLFFBQTZDO1FBRTdDLElBQUk7WUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyRCxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxPQUFPLFdBQVcsQ0FBQztTQUNwQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztDQUNGIn0=