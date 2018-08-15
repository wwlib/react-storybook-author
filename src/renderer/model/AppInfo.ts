export interface AppInfoData {

}

export default class AppInfo {

    constructor(options?: any) {
        options = options || {
        }
        this.initWithData(options);
    }

    initWithData(data: AppInfoData): void {

    }

    get json(): AppInfoData {
        let json: AppInfoData = {
        };
        return json;
    }

}
