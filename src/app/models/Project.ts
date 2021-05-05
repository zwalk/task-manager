export class Project {
    id : number | undefined;
    name : string | undefined;
    customerId : number | undefined;
    isBeingEdited : boolean = false;
    errorMessage : string | undefined = undefined;
}