import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Section } from './model/Section';
import { User } from './model/User';
import { Image } from './model/Image';
import { AuthService } from './service/auth.service';
import { SectionService } from './service/section.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked, OnInit {
  title = 'siteCv';

  popup: boolean = false;

  user = new User();

  newSection = new Section();

  updatedIdSection!: string;

  newImage = new Image();

  allEducationSection!: Section[];

  allExperiencesSection!: Section[];

  file!: File;

  error: boolean = false;

  log!: boolean;

  newExperience: boolean = false;

  @ViewChild('logo')
  private logo!: ElementRef;

  @ViewChild('id')
  private id!: ElementRef;

  @ViewChild('password')
  private password!: ElementRef;

  private imageByName = new Map<string, string>;

  updateOrSave: string = "Enregistrer";

  cancelOrDelete: string = "Annuler";

  isCollapsed: boolean = true;

  constructor(private renderer: Renderer2, private authService: AuthService, private sectionService: SectionService) {
    this.renderer.listen('window', 'scroll', (e) => {
      if ((e.target.scrollingElement as Element).scrollTop > 80) {
        this.renderer.setStyle(this.logo.nativeElement, "height", "56px");
        this.renderer.setStyle(this.logo.nativeElement, "width", "56px");
      } else {
        this.renderer.setStyle(this.logo.nativeElement, "height", "112px");
        this.renderer.setStyle(this.logo.nativeElement, "width", "112px");
      }
    });
  }

  ngOnInit(): void {
    this.sectionService.getSectionByCategory("experience").subscribe(sections => {
      this.allExperiencesSection = sections.sort((a, b) => a.date.substring(a.date.length - 4, a.date.length) > b.date.substring(b.date.length - 4, b.date.length) ? 1 : -1);
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

    this.log = !this.authService.isTokenExpired();
  }

  ngAfterViewChecked(): void {
  }

  openPopupConnection(): void {
    this.popup = true;
    this.error = false;
    this.user = new User();
  }

  closePopupConnection(): void {
    this.popup = false;
  }

  loggedin(): void {
    this.authService.login(this.user).subscribe({
      next: (data) => {
        let jwToken = data.headers.get('Authorization')!;
        this.authService.saveToken(jwToken);
        this.closePopupConnection();
        this.log = true;
      },
      error: (err) => {
        this.renderer.setStyle(this.id.nativeElement, "border", "2px inset red");
        this.renderer.setStyle(this.password.nativeElement, "border", "2px inset red");
        this.log = false;
      }
    });
  }

  loggedOut(): void {
    this.log = false;
    this.authService.logout();
  }
}
