import { WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

let ListBlockedStates: Array<string>;
let DependOnState: string;
let State: string;
let Rel: string;
let IsBlock: boolean;

export function TryChangeValue(changedFields: { [key: string]: any; }) {
    // if  state changed
    if (changedFields["System.State"] && ListBlockedStates.find(changedFields["System.State"])) {
        BlockState(changedFields["System.State"]);
    }
}
export function CreateView(dependOnState: string, listBlockedState: string, relBlocekd: string) {
    if (listBlockedState != undefined && listBlockedState != "" && dependOnState != undefined && dependOnState != "" && relBlocekd != undefined && relBlocekd != "") {
        IsBlock = false;
        ListBlockedStates = listBlockedState.split(';');
        DependOnState = dependOnState;
        Rel = relBlocekd;
        ReadData();
    }
}
function ReadData() {
    WorkItemFormService.getService().then(
        (service) => {
            service.getFieldValue("System.State").then((state: Object) => {
                State = state.toString();
                service.getWorkItemRelations().then((WorkItemRelations: WorkItemRelation[]) => {
                    let body = $("body");
                    let messageDiv = $("<label/>");
                    let dependenciesDiv = $("<div/>");
                    let messageDiv2 = $("<label/>");
                    if (WorkItemRelations.length > 0) {
                        let secondMessage = "On hold Because : ";
                        messageDiv.text("Dependens need to be " + State);
                        WorkItemRelations.forEach(WorkItemRelation => {
                            if (WorkItemRelation.rel == Rel) {
                                let href = $("<a/>");
                                href.text(WorkItemRelation.attributes["System.Id"] + " " + WorkItemRelation.attributes["System.WorkItemType"] + " " + WorkItemRelation.attributes["System.State"]);
                                href.attr("link", WorkItemRelation.url);
                                if (WorkItemRelation.attributes["System.State"] != DependOnState) {
                                    IsBlock = true;
                                    secondMessage += WorkItemRelation.attributes["System.Id"] + " ";
                                }
                                dependenciesDiv.append(href);
                            }
                        });
                        messageDiv2.text(secondMessage);
                    }
                    else {
                        messageDiv.text("Not Dependens ");
                    }
                    if (!IsBlock) {
                        messageDiv2.text("All Clear");
                    }
                    body.append(messageDiv);
                    body.append(dependenciesDiv);
                    body.append(messageDiv2);
                })
            })
        }
    );
}

function BlockState(state: string) {
    let message: string = "You cant chage state to " + state + " there is dependencies not " + DependOnState;
    // change back the state !!
}
