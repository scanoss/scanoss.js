export var ScannerEvents;
(function (ScannerEvents) {
    ScannerEvents["WINNOWING_STARTING"] = "WINNOWING_STARTING";
    ScannerEvents["WINNOWING_NEW_CONTENT"] = "WINNOWING_NEW_CONTENT";
    ScannerEvents["WINNOWING_STATUS"] = "WINNOWING_STATUS";
    ScannerEvents["WINNOWING_FINISHED"] = "WINNOWING_FINISHED";
    ScannerEvents["WINNOWER_LOG"] = "WINNOWER_LOG";
    ScannerEvents["DISPATCHER_WFP_SENDED"] = "DISPATCHER_WFP_SENDED";
    ScannerEvents["DISPATCHER_NEW_DATA"] = "DISPATCHER_NEW_DATA";
    ScannerEvents["DISPATCHER_FINISHED"] = "DISPATCHER_FINISHED";
    ScannerEvents["DISPATCHER_ITEM_NO_DISPATCHED"] = "DISPATCHER_ITEM_NO_DISPATCHED";
    ScannerEvents["DISPATCHER_QUEUE_SIZE_MAX_LIMIT"] = "DISPATCHER_QUEUE_FULL";
    ScannerEvents["DISPATCHER_QUEUE_SIZE_MIN_LIMIT"] = "DISPATCHER_QUEUE_SIZE_MIN_LIMIT";
    ScannerEvents["DISPATCHER_LOG"] = "DISPATCHER_LOG";
    ScannerEvents["ERROR_SCANNER_ABORTED"] = "ERROR_SCANNER_ABORTED";
    ScannerEvents["ERROR_SERVER_SIDE"] = "ERROR_SERVER_SIDE";
    ScannerEvents["ERROR_CLIENT_SIDE"] = "ERROR_CLIENT_SIDE";
    ScannerEvents["MODULE_DISPATCHER"] = "MODULE_DISPATCHER";
    ScannerEvents["MODULE_WINNOWER"] = "MODULE_WINNOWER";
    ScannerEvents["SCAN_DONE"] = "SCAN_DONE";
    ScannerEvents["RESULTS_APPENDED"] = "RESULTS_APPENDED";
    ScannerEvents["SCANNER_LOG"] = "SCANNER_LOG";
    ScannerEvents["ERROR"] = "error";
})(ScannerEvents || (ScannerEvents = {}));
;
export var WinnowingMode;
(function (WinnowingMode) {
    WinnowingMode["FULL_WINNOWING"] = "FULL_WINNOWING";
    WinnowingMode["FULL_WINNOWING_HPSM"] = "FULL_WINNOWING_HPSM";
    WinnowingMode["WINNOWING_ONLY_MD5"] = "WINNOWING_ONLY_MD5";
})(WinnowingMode || (WinnowingMode = {}));
;
export var SbomMode;
(function (SbomMode) {
    SbomMode["SBOM_IGNORE"] = "blacklist";
    SbomMode["SBOM_IDENTIFY"] = "identify";
})(SbomMode || (SbomMode = {}));
;
export var ScannerComponentId;
(function (ScannerComponentId) {
    ScannerComponentId["NONE"] = "none";
    ScannerComponentId["FILE"] = "file";
    ScannerComponentId["SNIPPET"] = "snippet";
})(ScannerComponentId || (ScannerComponentId = {}));
;
/********************** Scanner results types **********************/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lclR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nkay9zY2FubmVyL1NjYW5uZXJUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLENBQU4sSUFBWSxhQTZCWDtBQTdCRCxXQUFZLGFBQWE7SUFDdkIsMERBQXlDLENBQUE7SUFDekMsZ0VBQStDLENBQUE7SUFDL0Msc0RBQXFDLENBQUE7SUFDckMsMERBQXlDLENBQUE7SUFDekMsOENBQTZCLENBQUE7SUFFN0IsZ0VBQStDLENBQUE7SUFDL0MsNERBQTJDLENBQUE7SUFDM0MsNERBQTJDLENBQUE7SUFDM0MsZ0ZBQStELENBQUE7SUFDL0QsMEVBQXlELENBQUE7SUFDekQsb0ZBQW1FLENBQUE7SUFDbkUsa0RBQWlDLENBQUE7SUFFakMsZ0VBQStDLENBQUE7SUFFL0Msd0RBQXVDLENBQUE7SUFDdkMsd0RBQXVDLENBQUE7SUFFdkMsd0RBQXVDLENBQUE7SUFDdkMsb0RBQW1DLENBQUE7SUFFbkMsd0NBQXVCLENBQUE7SUFDdkIsc0RBQXFDLENBQUE7SUFFckMsNENBQTJCLENBQUE7SUFFM0IsZ0NBQWUsQ0FBQTtBQUNqQixDQUFDLEVBN0JXLGFBQWEsS0FBYixhQUFhLFFBNkJ4QjtBQUFBLENBQUM7QUFFRixNQUFNLENBQU4sSUFBWSxhQUlYO0FBSkQsV0FBWSxhQUFhO0lBQ3ZCLGtEQUFpQyxDQUFBO0lBQ2pDLDREQUEyQyxDQUFBO0lBQzNDLDBEQUF5QyxDQUFBO0FBQzNDLENBQUMsRUFKVyxhQUFhLEtBQWIsYUFBYSxRQUl4QjtBQUFBLENBQUM7QUFFRixNQUFNLENBQU4sSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2xCLHFDQUF5QixDQUFBO0lBQ3pCLHNDQUEwQixDQUFBO0FBQzVCLENBQUMsRUFIVyxRQUFRLEtBQVIsUUFBUSxRQUduQjtBQVlBLENBQUM7QUFNRixNQUFNLENBQU4sSUFBWSxrQkFBdUU7QUFBbkYsV0FBWSxrQkFBa0I7SUFBRSxtQ0FBYSxDQUFBO0lBQUUsbUNBQWEsQ0FBQTtJQUFHLHlDQUFtQixDQUFBO0FBQUEsQ0FBQyxFQUF2RSxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBQXFEO0FBQUEsQ0FBQztBQW9FcEYscUVBQXFFIn0=