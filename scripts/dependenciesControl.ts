import { CreateView, TryChangeValue } from "./dependenciesView";
export class Controller {
    constructor(id: number) {
        let inputs = VSS.getConfiguration().witInputs; 
        let ListBlockedState = inputs["ListBlockedState"];
        let RelBlocekd = inputs["RelBlocekd"];
        let DependOnState = inputs["DependOnState"];
        CreateView(DependOnState, ListBlockedState, RelBlocekd)
    }
    public FieldChanged(changedFields: { [key: string]: any; }) {
        TryChangeValue(changedFields);
    }
}
