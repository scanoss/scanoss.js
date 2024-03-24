export class Logger {
    constructor() {
        this.setLevel(Logger.Level.info);
        this.setTransport((msg) => { console.log(msg); });
    }
    setTransport(transport) {
        this.transport = transport;
    }
    setLevel(level = Logger.Level.info) {
        this.level = level;
    }
    log(msg, level = Logger.Level.info) {
        if (this.level >= level)
            this.transport(msg);
    }
}
(function (Logger) {
    let Level;
    (function (Level) {
        Level[Level["error"] = 0] = "error";
        Level[Level["warn"] = 1] = "warn";
        Level[Level["info"] = 2] = "info";
        Level[Level["verbose"] = 3] = "verbose";
        Level[Level["debug"] = 4] = "debug";
    })(Level = Logger.Level || (Logger.Level = {}));
})(Logger || (Logger = {}));
export const logger = new Logger();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Nkay9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxPQUFPLE1BQU07SUFJakI7UUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFLEdBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTSxZQUFZLENBQUMsU0FBK0I7UUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUk7UUFDL0MsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUs7WUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FFRjtBQUVELFdBQWlCLE1BQU07SUFHckIsSUFBWSxLQU1YO0lBTkQsV0FBWSxLQUFLO1FBQ2YsbUNBQUssQ0FBQTtRQUNMLGlDQUFJLENBQUE7UUFDSixpQ0FBSSxDQUFBO1FBQ0osdUNBQU8sQ0FBQTtRQUNQLG1DQUFLLENBQUE7SUFDUCxDQUFDLEVBTlcsS0FBSyxHQUFMLFlBQUssS0FBTCxZQUFLLFFBTWhCO0FBQ0gsQ0FBQyxFQVZnQixNQUFNLEtBQU4sTUFBTSxRQVV0QjtBQUVELE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDIn0=