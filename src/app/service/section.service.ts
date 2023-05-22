import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Section } from '../model/Section';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SectionService {

  private apiUrl: string = "http://localhost:8080/cv/api/";
  private imageUrl: string = 'http://localhost:8080/cv/image/';

  constructor(private http: HttpClient) { }

  saveSection(section: Section) {
    return this.http.post<Section>(this.apiUrl + "section", section, { observe: 'response' });
  }

  saveImage(file: File) {
    const imageFormData = new FormData();
    imageFormData.append('image', file, file.name);

    return this.http.post(this.imageUrl + 'upload', imageFormData, { observe: 'response' });
  }

  getSectionByCategory(category: string): Observable<Section[]> {
    let httpParams = new HttpParams();
    httpParams.append("cat", category);

    return this.http.get<Section[]>(this.apiUrl + "section?cat=" + category);
  }

  getImageByName(name: string) {
    return this.http.get(this.imageUrl + name, { responseType: 'blob' });
  }

  removeSection(section: Section) {
    return this.http.delete<Section>(this.apiUrl + "section/remove", { observe: 'response', body: section });
  }

  updateSection(section: Section) {
    return this.http.put<Section>(this.apiUrl + "section/update", section, { observe: 'response' });
  }
}
