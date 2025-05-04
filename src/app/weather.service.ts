import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface WeatherData {
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.apiKey;
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  getWeather(city: string, units: 'metric' | 'imperial' = 'metric'): Observable<WeatherData> {
    const url = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=${units}`;
    return this.http.get<WeatherData>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred. Please try again.';
        if (error.status === 401) {
          errorMessage = 'Unauthorized: Invalid or inactive API key.';
        } else if (error.status === 404) {
          errorMessage = 'City not found.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}