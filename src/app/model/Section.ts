export class Section{
    uuid!:string;
    title!:string;
    body!:string;
    date!:string;
    category!:string
    imageName!:string;

    isValid(): boolean{
        return this.title != undefined && this.body != undefined && this.date != undefined && this.imageName != undefined;
    }
}