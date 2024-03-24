import { LocalDependencies } from './LocalDependency';
import { assert, expect } from 'chai';
describe('Suit test for LocalDependency Scanner', () => {
    it('Testing wildcard string matching', function () {
        const localDependencyScanner = new LocalDependencies();
        assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "hello*"));
        assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*hello*"));
        assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*"));
        assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*this*"));
        assert(localDependencyScanner.stringMatchWithWildcard("/home/user/projname.cproj", "*.cproj"));
        assert(!localDependencyScanner.stringMatchWithWildcard("this text should no match", "*hello*"));
        assert(!localDependencyScanner.stringMatchWithWildcard("/home/user/projname.cproj", "*hello"));
    });
    it('Testing filepath filter function', function () {
        const localDependencyScanner = new LocalDependencies();
        const files = [
            "/home/user/ignore.c",
            "/home/user/go.sum",
            "/home/user/accept.csproj",
            "/home/user/ignore2.c",
        ];
        const expectedOut = [
            "/home/user/go.sum",
            "/home/user/accept.csproj",
        ];
        const result = localDependencyScanner.filterFiles(files);
        for (let i = 0; i < result.length; i++) {
            expect(expectedOut[i]).to.be.equal(result[i]);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxEZXBlbmRlbmN5LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9Mb2NhbERlcGVuZGVuY3kvTG9jYWxEZXBlbmRlbmN5LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFdEMsUUFBUSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtJQUVyRCxFQUFFLENBQUMsa0NBQWtDLEVBQUc7UUFDdEMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDdkQsTUFBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekYsTUFBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDMUYsTUFBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEYsTUFBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekYsTUFBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDL0YsTUFBTSxDQUFDLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRyxNQUFNLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyx1QkFBdUIsQ0FBQywyQkFBMkIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUMsQ0FBQyxDQUFDO0lBSUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFHO1FBQ3RDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHO1lBQ1oscUJBQXFCO1lBQ3JCLG1CQUFtQjtZQUNuQiwwQkFBMEI7WUFDMUIsc0JBQXNCO1NBQ3ZCLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRztZQUNsQixtQkFBbUI7WUFDbkIsMEJBQTBCO1NBQzNCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekQsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7WUFDaEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9DO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFTCxDQUFDLENBQUMsQ0FBQyJ9