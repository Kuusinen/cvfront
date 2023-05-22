import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Section } from '../model/Section';
import { SectionService } from '../service/section.service';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {

  @Input()
  log!: boolean;

  allSectionXp!: Section[];

  private imageByName = new Map<string, string>;

  @ViewChild('backgroundImage')
  private backgroundImage!: ElementRef;

  newSection = new Section();

  newXp: boolean = false;

  updateOrSave: string = "Enregistrer";

  cancelOrDelete: string = "Annuler";

  file!: File;

  updateMode: boolean = false;

  constructor(private sectionService: SectionService, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.sectionService.getSectionByCategory("experience").subscribe(sections => {
      this.allSectionXp = sections.sort((a, b) => a.date.substring(a.date.length - 4, a.date.length) > b.date.substring(b.date.length - 4, b.date.length) ? 1 : -1);
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

  loadImage(name: string): string {
    return this.imageByName.get(name) as string;
  }

  putEditSection(section: Section) {
    this.updateOrSave = "Modifier";
    this.updateMode = true;
    this.cloneOriginalSection(section);
    const index = this.allSectionXp.indexOf(section);
    this.allSectionXp.splice(index, 1);
    this.newXp = true;

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

  removeSection(section: Section) {
    this.sectionService.removeSection(section).subscribe({
      next() {
        window.location.reload();
      }
    });
  }

  cancel(): void {
    this.newXp = false;
    this.newSection = new Section();
    if (this.updateMode) {
      window.location.reload();
    }
  }

  saveSection(): void {
    if (this.newSection.isValid()) {
      if (this.file == undefined && this.updateMode) {
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
      }
    } else {
      Swal.fire({ title: 'erreur', html: "Tous les champs doivent être correctement remplis !", icon: 'error', confirmButtonColor: "#db9522", color: "#dedad6", background: "#212529" });
    }
  }

  addEducation(): void {
    this.newXp = true;
    this.newSection.category = "experience";
    this.updateOrSave = "Enregistrer";
    this.cancelOrDelete = "Annuler";
  }

}
