export default class PathProcessor {
    public FillPathWithVar(variables: Map<string, string>, path: string): string {
        const urlRegExp = /(?<=\$)\w*(?=\$)/g;
        let str = '';
        const result = path.match(urlRegExp);
        if (result != null) {
            variables.forEach((value: string, key: string) => {
                result.forEach((label) => {
                    // tslint:disable-next-line:triple-equals
                    if (label == key) {
                        str = '\$' + label + '\$';
                        path = path.replace(str, value);
                    }
                });
            });
        }
        return path;
    }
    public extractVarFromPath(path: string): string[] {
        let inputLabel: string[];
        inputLabel = [];
        const urlRegExp = /(?<=\$)\w*(?=\$)/g;
        const result = path.match(urlRegExp);
        if (result != null) {
            result.forEach((element: string) => {
            if(element != "")
            {
                inputLabel.push(element);
            }
            });
        }
        return inputLabel;
    }
}
