import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit{

  FormData!: FormGroup;
  constructor(private builder: FormBuilder) { }


  ngOnInit() {
    this.FormData = this.builder.group({
      Fullname: new FormControl('', [Validators.required]),
      Comment: new FormControl('', [Validators.required])
    });
  }


  onSubmit() {
    console.log(FormData);
  }

}
