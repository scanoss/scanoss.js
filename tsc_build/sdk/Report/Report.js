import fs from 'fs';
import path from 'path';
import { DataProviderManager } from './DataLayer/DataProviderManager';
export class Report {
    constructor(dpm = new DataProviderManager()) {
        this.templatePath = path.join(__dirname, '../../../../assets/ReportHTMLTemplate/index.html');
        this.dataPlaceholder = '#DATA';
        this.dataProviderManager = dpm;
    }
    setDataProviderManager(dpm) {
        this.dataProviderManager = dpm;
    }
    setTemplatePath(filePath) {
        this.templatePath = filePath;
    }
    getTemplatePath() {
        return this.templatePath;
    }
    async getHTML() {
        this.dataLayer = await this.dataProviderManager.generateData();
        const html = await fs.promises.readFile(this.getTemplatePath(), 'utf-8');
        if (!html)
            throw new Error('Invalid template path');
        if (!html.includes(this.dataPlaceholder))
            throw new Error(`Placeholder ${this.dataPlaceholder} not found, cannot insert the data`);
        this.report = html.replace(this.dataPlaceholder, JSON.stringify(this.dataLayer).replace(/\\\"/g, '\\\\u0022'));
        return this.report;
    }
    async saveToFile(fsPath) {
        return await fs.promises.writeFile(fsPath, this.report, 'utf-8');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nkay9SZXBvcnQvUmVwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFHdEUsTUFBTSxPQUFPLE1BQU07SUFhakIsWUFBWSxNQUEyQixJQUFJLG1CQUFtQixFQUFFO1FBTnhELGlCQUFZLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FDdEMsU0FBUyxFQUNULGtEQUFrRCxDQUNuRCxDQUFDO1FBRU0sb0JBQWUsR0FBVyxPQUFPLENBQUM7UUFFeEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztJQUNqQyxDQUFDO0lBRU0sc0JBQXNCLENBQUMsR0FBd0I7UUFDcEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztJQUNqQyxDQUFDO0lBRU0sZUFBZSxDQUFDLFFBQWdCO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0lBQy9CLENBQUM7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU87UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMvRCxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQ2IsZUFBZSxJQUFJLENBQUMsZUFBZSxvQ0FBb0MsQ0FDeEUsQ0FBQztRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDeEIsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FDN0QsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjO1FBQ3BDLE9BQU8sTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0NBQ0YifQ==