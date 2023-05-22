import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Section } from '../model/Section';
import { AuthService } from '../service/auth.service';
import { SectionService } from '../service/section.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {

  newEducation: boolean = false;

  updateMode: boolean = false;

  imageImport: boolean = false;

  newSection = new Section();

  allEducationSection!: Section[];

  private imageByName = new Map<string, string>;

  updateOrSave: string = "Enregistrer";

  cancelOrDelete: string = "Annuler";

  file!: File;

  @ViewChild('backgroundImage')
  private backgroundImage!: ElementRef;

  @Input()
  log!: boolean;

  constructor(private renderer: Renderer2, private authService: AuthService, private sectionService: SectionService) {

  }

  ngOnInit(): void {
    this.sectionService.getSectionByCategory("education").subscribe(sections => {
      this.allEducationSection = sections.sort((a, b) => a.date.substring(a.date.length - 4, a.date.length) > b.date.substring(b.date.length - 4, b.date.length) ? 1 : -1);
      sections.forEach(section => {
        this.sectionService.getImageByName(section.imageName).subscribe(value => {
          const reader = new FileReader();
          reader.readAsDataURL(value);

          reader.onload = () => {
            const byteImage = reader.result as string;
            this.imageByName.set(section.imageName, byteImage);
          }
        });
      });
    });
  }

  addEducation(): void {
    this.newEducation = true;
    this.newSection.category = "education";
    this.updateOrSave = "Enregistrer";
    this.cancelOrDelete = "Annuler";
  }

  importImage(event: any): void {
    const reader = new FileReader();
    this.file = event.target.files[0];
    reader.readAsDataURL(this.file);

    reader.onload = () => {
      const byteImage = reader.result as string;
      this.newSection.imageName = this.file.name;
      this.renderer.setStyle(this.backgroundImage.nativeElement, "background-image", "url(" + byteImage + ")");
    }
  }
  
  saveSection(): void {
    if (this.newSection.isValid()) {
      this.sectionService.saveImage(this.file).subscribe({
        next: (imgData) => {
          if (imgData.ok) {
            console.log(imgData);
            if (this.updateMode) {
              this.sectionService.updateSection(this.newSection).subscribe({
                next(value) {
                  window.location.reload();
                },
                error: (err: any) => {
                  Swal.fire({ title: 'erreur', html: "impossible de mettre à jour l'article !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
                }
              })
              this.updateMode = false;
            } else {
              this.sectionService.saveSection(this.newSection).subscribe({
                next: (data) => {
                  if (data.ok) {
                    window.location.reload();
                  } else {
                    Swal.fire({ title: 'erreur', html: "impossible de créer un nouvel article !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
                  }
                },
                error: (err: any) => {
                  Swal.fire({ title: 'erreur', html: "impossible de créer un nouvel article !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
                }
              })
            }
          } else {
            Swal.fire({ title: 'erreur', html: "impossible de créer un nouvel article !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
          }
        },
        error: (err: any) => {
          Swal.fire({ title: 'erreur', html: "impossible de créer un nouvel article !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
        }
      });
    } else {
      Swal.fire({ title: 'erreur', html: "Tous les champs doivent être correctement remplis !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
    }
  }

  cancel(): void {
    this.newEducation = false;
    this.newSection = new Section();
    if (this.updateMode) {
      window.location.reload();
    }
  }

  loadImage(name: string): string {
    return this.imageByName.get(name) as string;
  }

  removeSection(section: Section) {
    this.sectionService.removeSection(section).subscribe({
      next() {
        window.location.reload();
      }
    });
  }

  putEditSection(section: Section) {
    this.updateOrSave = "Modifier";
    this.updateMode = true;
    this.cloneOriginalSection(section);
    const index = this.allEducationSection.indexOf(section);
    this.allEducationSection.splice(index, 1);
    this.newEducation = true;

    this.sectionService.getImageByName(section.imageName).subscribe(value => {
      const reader = new FileReader();
      reader.readAsDataURL(value);

      reader.onload = () => {
        const byteImage = reader.result as string;
        this.renderer.setStyle(this.backgroundImage.nativeElement, "background-image", "url(" + byteImage + ")");
      }
    });
  }

  private cloneOriginalSection(section: Section) {
    this.newSection.uuid = section.uuid;
    this.newSection.title = section.title;
    this.newSection.body = section.body;
    this.newSection.date = section.date;
    this.newSection.category = section.category;
    this.newSection.imageName = section.imageName;
  }
}
