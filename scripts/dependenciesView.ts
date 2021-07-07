import { WorkItemExpand, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import RestClient = require("TFS/WorkItemTracking/RestClient");

let ListBlockedStates: Array<string>;
let DependOnState: string;
let State: string;
let Rel: string;
let IsBlock: boolean;
let client: RestClient.WorkItemTrackingHttpClient4_1 = RestClient.getClient();
export function TryChangeValue(changedFields: { [key: string]: any; }) { 
    if (changedFields["System.State"]) {
        ListBlockedStates.forEach(checkState => {
            if (checkState == changedFields["System.State"] && IsBlock) {
                BlockState(changedFields["System.State"]);
            }
        });
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
                        messageDiv.text("Dependens need to be " + DependOnState);
                        let ids: number[] = [];
                        let Urls: string[] = [];
                        WorkItemRelations.forEach(WorkItemRelation => {
                            if (WorkItemRelation.rel == Rel) {
                                let linkURL = WorkItemRelation.url;
                                let idBuild = linkURL.split('/')
                                let id = Number.parseInt(idBuild[idBuild.length - 1]);
                                ids.push(id); Urls.push(linkURL);
                            }
                        });
                        client.getWorkItems(ids, null, null, WorkItemExpand.All).then((workItems) => {
                            workItems.forEach(workItem => {
                                let href = $("<a/>");
                                href.text(workItem.fields["System.Id"] + " " + workItem.fields["System.WorkItemType"] + " " + workItem.fields["System.State"]);
                                href.attr("link", workItem.url);
                                dependenciesDiv.append(href);
                                if (workItem.fields["System.State"] != DependOnState) {
                                    IsBlock = true;
                                    secondMessage += workItem.fields["System.Id"] + " ";
                                }
                                messageDiv2.text(secondMessage);
                                VSS.resize();
                            })
                        })
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
                    VSS.resize();
                })
            })
        }
    );
}

function BlockState(state: string) {
    let message: string = "You cant chage state to " + state + " there is dependencies not " + DependOnState;
    alert(message);
    WorkItemFormService.getService().then(
        (service) => {
            service.setFieldValue("System.State", State);
        });
}