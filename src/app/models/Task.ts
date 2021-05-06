export class Task {
    id : number | undefined;
    description : string | undefined;
    projectId : number | undefined;
    isBeingEdited : boolean = false;
    errorMessage : string | undefined = undefined;
    isTimeBeingLogged : boolean | undefined;
    taskLogError : string | undefined = undefined;
}