import { Controller } from "./dependenciesControl";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";

let controller: Controller;
let provider = () => {
    return {
        onLoaded: (workItemLoadedArgs: ExtensionContracts.IWorkItemLoadedArgs) => {
            controller = new Controller(workItemLoadedArgs.id);
        },
        onFieldChanged: (fieldChangedArgs: ExtensionContracts.IWorkItemFieldChangedArgs) => {
            let changedValue = fieldChangedArgs.changedFields;
            controller.FieldChanged(changedValue)
        }
    };
};
VSS.register(VSS.getContribution().id, provider);