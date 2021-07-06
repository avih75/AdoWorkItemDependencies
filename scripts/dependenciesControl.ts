import { CreateView, TryChangeValue } from "./dependenciesView";
export class Controller {
    constructor(id: number) {
        let inputs = VSS.getConfiguration().witInputs;
        let ApprovelStateField = inputs["ApprovelStateField"];
        let ValueToApproveField = inputs["ValueToApproveField"];
        let ApprovedValueField = inputs["ApprovedValueField"];
        let LastRequested = inputs["LastRequested"];
        let LastRequestState = inputs["LastRequestState"];
        let ApproveBy = inputs["ApproveBy"];
        let ApproveValueCondition = inputs["ApproveValueCondition"];
        let ApproveCondition = inputs["ApproveCondition"];
        let ApprovedPreviusApprove = inputs["ApprovedPreviusApprove"];
        let ApprovedComment = inputs["ApprovedComment"];
        let Approver = inputs["Approver"];
        let TrigerNeedApproveState = inputs["TrigerNeedApproveState"];
        let BlockField = inputs["BlockField"];
        if (!ApprovedComment)
            ApprovedComment = "";
        CreateView(ApprovelStateField, ValueToApproveField, ApprovedValueField, ApproveBy, ApproveValueCondition,
            ApproveCondition, ApprovedPreviusApprove, ApprovedComment, LastRequested, LastRequestState, Approver,
            BlockField, TrigerNeedApproveState);
    }
    public FieldChanged(changedFields: { [key: string]: any; }) {
        TryChangeValue(changedFields);
    }
}
