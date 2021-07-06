import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

let ApproveStateRef: string;
let RequestedValueRef: string;
let ApprovedValueRef: string;
let ApproveByRef: string;
let ParentStateRef: string;
let CommentRef: string;
let LastRequestedRef: string;
let LastRequestStateRef: string;
let ApproverRef: string;
let BlockFieldRef: string;

let WorkItemState: string;
let ApproveState: string;
let RequestedValue: number;
let ApprovedValue: number;
let ApproveBy: string;
let ConditionValue: number;
let Condition: string;
let ParentState: string;
let Comment: string;
let LastRequestedValue: number
let LastRequestState: string;
let ApproverName: string;
let BlockFieldValue: string;
let TrigerNeedApproveStateValue: string;

let ConnectedUser: UserContext;
let FieldList: IDictionaryStringTo<Object>;

export function TryChangeValue(changedFields: { [key: string]: any; }) {
    let flag: Boolean = false;
    if (changedFields["System.State"]) {
        WorkItemState = changedFields["System.State"].toString();
        FieldList["System.State"] = WorkItemState;
    }
    if (ParentStateRef != "" && changedFields[ParentStateRef]) {
        ParentState = changedFields[ParentStateRef];
        FieldList[ParentStateRef] = ParentState;
        flag = true;
    }
    if (changedFields[RequestedValueRef]) {
        RequestedValue = changedFields[RequestedValueRef];
        flag = true;
    }
    if (flag)
        CheckControlStatus();
}
export function CreateView(ApprovelStateField, ValueToApproveField, ApprovedValueField, ApproveBy, ApproveValueCondition, ApproveCondition,
    ApprovedPreviusApprove, ApprovedComment, LastRequest, LastRequestState, Approver, BlockField, TrigerNeedApproveState) {
    ApproveStateRef = ApprovelStateField;
    RequestedValueRef = ValueToApproveField;
    ApprovedValueRef = ApprovedValueField;
    ApproveByRef = ApproveBy;
    ConditionValue = ApproveValueCondition;
    Condition = ApproveCondition;
    ParentStateRef = ApprovedPreviusApprove;
    CommentRef = ApprovedComment;
    LastRequestedRef = LastRequest;
    ApproverRef = Approver ? Approver : "";
    BlockFieldRef = BlockField ? BlockField : "";
    LastRequestStateRef = LastRequestState;
    TrigerNeedApproveStateValue = (TrigerNeedApproveState) ? TrigerNeedApproveState : "";
    ConnectedUser = VSS.getWebContext().user;
    ReadData();
}
function ReadData() {
    WorkItemFormService.getService().then(
        (service) => {
            service.getFieldValues(["System.State", ApproveStateRef, RequestedValueRef, ApprovedValueRef, ApproveByRef,
                ParentStateRef, CommentRef, LastRequestedRef, ApproverRef, BlockFieldRef, LastRequestStateRef]).then((fieldList: IDictionaryStringTo<Object>) => {
                    FieldList = fieldList;
                    if (fieldList[RequestedValueRef])
                        RequestedValue = Number.parseInt(fieldList[RequestedValueRef].toString());
                    else
                        RequestedValue = -1;
                    if (fieldList[ApprovedValueRef])
                        ApprovedValue = Number.parseInt(fieldList[ApprovedValueRef].toString());
                    if (fieldList[LastRequestedRef])
                        LastRequestedValue = Number.parseInt(fieldList[LastRequestedRef].toString());
                    LastRequestState = fieldList[LastRequestStateRef] ? fieldList[LastRequestStateRef].toString() : "";
                    if (fieldList[ApproveStateRef] && fieldList[ApproveStateRef].toString() != "") {
                        ApproveState = fieldList[ApproveStateRef].toString();
                    }
                    ParentState = fieldList[ParentStateRef] ? fieldList[ParentStateRef].toString() : "Approved"; //Approved
                    BlockFieldValue = (BlockFieldRef != "") ? fieldList[BlockFieldRef].toString() : "";
                    ApproverName = (ApproverRef != "") ? fieldList[ApproverRef].toString() : "";
                    ApproveBy = fieldList[ApproveByRef] ? fieldList[ApproveByRef].toString() : "";
                    WorkItemState = fieldList["System.State"].toString();
                    if (CommentRef != "")
                        Comment = fieldList[CommentRef].toString();
                    else
                        Comment = "no comment field connected";
                    CheckControlStatus();
                })
        }
    );
}
function CheckControlStatus() {
    if (IRequired()) {
        if (ParentState != "Approved" && ParentState != "NA.") {
            NeedState("Need Approve");
        }
    }
    else {
        if (ParentState == "Approved" || ParentState == "NA.") {
            NeedState("NA.")
        }
        else {
            NeedState("NA");
        }
    }
    BuildTheView();
    SetAssignTo();
    UpdateWorkItem();
}
function NeedState(state: string) {
    if (ApproveState != state) {
        ApproveState = state;
        //FieldList[ApproveStateRef] = ApproveState;
        if (state == "Approved" || state == "NA.")
            BlockFieldValue = "Accept";
        else
            BlockFieldValue = "";
    }
}
function BuildTheView() {
    let body = $("body");
    if (IRequired()) {
        body.show();
        SetApproveImage();
        if ((ParentState == "Approved" || ParentState == "NA.") && (ApproverName == "" ||
            ApproverName == ConnectedUser.email ||
            ApproverName == ConnectedUser.name ||
            ApproverName == ConnectedUser.uniqueName)) {
            SetApproveButtons();
        }
        else {
            $("#btns").hide();
            body.prop("disabled", true);
            body.prop("height", "90px");
        }
    }
    else {
        // if (BlockFieldRef != "") {
        //     if (ParentState == "Approved" && BlockFieldValue != "Accept") {
        //         BlockFieldValue = "Accept"; 
        //     }
        //     else if (ParentState != "Approved" && BlockFieldValue == "Accept") {
        //         BlockFieldValue = ""; 
        //     }
        // }
        body.hide();
    }

}
function IRequired() {
    let flag = false;
    if (Condition == "=") {
        if (ConditionValue == RequestedValue) {
            flag = true;
        }
    }
    else if (Condition == ">") {
        if (RequestedValue > ConditionValue) {
            flag = true;
        }
    }
    else if (Condition == "<") {
        if (RequestedValue < ConditionValue) {
            flag = true;
        }
    }
    else if (Condition == "Any") {
        flag = true;
    }
    return flag;
}
function SetApproveImage() {
    GetImageSource();
    let LabelLastRequest = $("#LastRequest");
    if (ApproveState == "Approved") {
        $("#RequireName").text("Approved by: " + ApproveBy);
    }
    else if (ApproveState == "NA" || ApproveState == "NA.") {
        $("#RequireName").text("NA");
    }
    else if (ApproverName != "") {
        $("#RequireName").text("Need approval from: " + ApproverName);
    }
    $("#Comment").val(Comment);
    if (CommentRef == "")
        $("#Comment").prop("disabled", true);
    if (LastRequestedValue) {
        LabelLastRequest.text("Last requested amount: " + LastRequestedValue + " was " + LastRequestState + " By " + ApproveBy);
        if (LastRequestState == "Approved") {
            LabelLastRequest.css("color", "green");
        }
        else if (LastRequestState == "Rejected") {
            LabelLastRequest.css("color", "red");
        }
        else if (LastRequestState == "On Hold") {
            LabelLastRequest.css("color", "black");
        }
    }
    let LabelApprovedValueText = $("#approvedValue");
    if ((ApproveState == "Aporoved" && ApprovedValue > RequestedValue) || (ApprovedValue && ApproveState != "Approved")) {
        LabelApprovedValueText.text("Approved amount: " + ApprovedValue);
        LabelApprovedValueText.css("color", "green");
    }
}
function GetImageSource() {
    let image = $("#state");
    let imageSource = "";
    switch (ApproveState) {
        case "Approved": {
            imageSource = "img/approveBtn.png";
            break;
        }
        case "NA": {
            imageSource = "img/NA.png";
            break;
        }
        case "NA.": {
            imageSource = "img/NA.png";
            break;
        }
        case "Rejected": {
            imageSource = "img/RejectBtn.png";
            break;
        }
        case "On Hold": {
            imageSource = "img/OnHoldBtn.png";
            break;
        }
        case "Need Approve": {
            imageSource = "img/NeedApproveIcon.png";
            break;
        }
    }
    image.attr("src", imageSource);
}
function SetApproveButtons() {
    $("#ApproveBtn").click(() => {
        if (ApproveState != "Approved") {
            ButtonPressed("Approved");
        }
    });
    $("#RejectBtn").click(() => {
        if (ApproveState != "Rejected") {
            ButtonPressed("Rejected");
        }
    });
    $("#HoldBtn").click(() => {
        if (ApproveState != "On Hold") {
            ButtonPressed("On Hold");
        }
    });
    if (CommentRef != "")
        $("#Comment").keyup(() => {
            Comment = $("#Comment").val();
            UpdateWorkItem();
        })
}
function ButtonPressed(pressed: string) {
    NeedState(pressed);
    LastRequestState = pressed;
    ApproveBy = ConnectedUser.uniqueName;
    LastRequestedValue = RequestedValue;
    if (ApproveState == "Approved") {
        if (ApprovedValue == undefined || RequestedValue > ApprovedValue) {
            ApprovedValue = RequestedValue;
        }
    }
    else {
        if (RequestedValue <= ApprovedValue) {
            ApprovedValue = undefined;
        }
    }
    SetApproveImage();
    UpdateWorkItem();
}
function UpdateWorkItem() {
    let needUpdate = false;
    if (FieldList[ApproveStateRef].toString() != ApproveState) {
        FieldList[ApproveStateRef] = ApproveState;
        needUpdate = true;
    }
    if (!FieldList[RequestedValueRef] || Number.parseInt(FieldList[RequestedValueRef].toString()) != RequestedValue) {
        FieldList[RequestedValueRef] = RequestedValue;
        needUpdate = true;
    }
    if (!FieldList[ApprovedValueRef] || Number.parseInt(FieldList[ApprovedValueRef].toString()) != ApprovedValue) {
        FieldList[ApprovedValueRef] = ApprovedValue;
        needUpdate = true;
    }
    if (FieldList[ApproveByRef].toString() != ApproveBy) {
        FieldList[ApproveByRef] = ApproveBy;
        needUpdate = true;
    }
    if (CommentRef != "" && FieldList[CommentRef].toString() != Comment) {
        FieldList[CommentRef] = Comment;
        needUpdate = true;
    }
    if (!FieldList[LastRequestedRef] || Number.parseInt(FieldList[LastRequestedRef].toString()) != LastRequestedValue) {
        FieldList[LastRequestedRef] = LastRequestedValue;
        needUpdate = true;
    }
    if (!FieldList[LastRequestStateRef] || FieldList[LastRequestStateRef].toString() != LastRequestState) {
        FieldList[LastRequestStateRef] = LastRequestState;
        needUpdate = true;
    }
    if (BlockFieldRef != "" && FieldList[BlockFieldRef].toString() != BlockFieldValue) {
        FieldList[BlockFieldRef] = BlockFieldValue;
        needUpdate = true;
    }
    // no need the approver and the parent state, because we not changing them.
    if (needUpdate) {
        WorkItemFormService.getService().then(
            async (service) => {
                await service.setFieldValues(FieldList);
            }
        );
    }
}
function SetAssignTo() {
    if (TrigerNeedApproveStateValue != "" && WorkItemState == TrigerNeedApproveStateValue && IRequired() && BlockFieldValue == "") {
        if (ParentState == "Approved" && ApproveState == "Need Approve" && ApproverName != "") {
            WorkItemFormService.getService().then(
                async (service) => {
                    await service.setFieldValue("System.AssignedTo", ApproverName);
                }
            )
        }
    }
}