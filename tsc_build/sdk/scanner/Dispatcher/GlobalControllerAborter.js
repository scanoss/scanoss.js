import AbortController from 'abort-controller';
export class GlobalControllerAborter {
    constructor() {
        this.abortControllerList = [];
        this.abortFlag = false;
    }
    abortAll() {
        this.abortFlag = true;
        for (const c of this.abortControllerList)
            c.abort();
    }
    isAborting() {
        return this.abortFlag;
    }
    getAbortController() {
        const c = new AbortController();
        this.abortControllerList.push(c);
        return c;
    }
    removeAbortController(c) {
        const index = this.abortControllerList.findIndex((controller) => controller === c);
        if (index > -1)
            this.abortControllerList.splice(index, 1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsQ29udHJvbGxlckFib3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvRGlzcGF0Y2hlci9HbG9iYWxDb250cm9sbGVyQWJvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLGVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUUvQyxNQUFNLE9BQU8sdUJBQXVCO0lBS2xDO1FBQ0UsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQjtZQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE1BQU0sQ0FBQyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0YifQ==