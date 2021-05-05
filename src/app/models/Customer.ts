export class Customer {
    id : number | undefined;
    name : string | undefined;
    isBeingEdited : boolean = false;
    errorMessage : string | undefined = undefined;
}