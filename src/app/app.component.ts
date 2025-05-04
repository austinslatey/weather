import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from './weather.service';

interface WeatherData {
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AppComponent implements OnInit {
  city: string = '';
  weather: WeatherData | null = null;
  error: string | null = null;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    // Optionally load last searched city from localStorage
    this.city = localStorage.getItem('lastCity') || '';
    if (this.city) {
      this.getWeather();
    }
  }

  getWeather() {
    if (this.city.trim()) {
      this.weatherService.getWeather(this.city).subscribe({
        next: (data) => {
          this.weather = data;
          this.error = null;
          localStorage.setItem('lastCity', this.city);
        },
        error: () => {
          this.error = 'City not found or API error. Please try again.';
          this.weather = null;
        }
      });
    }
  }
}