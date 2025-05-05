import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  city: string = '';
  weather: WeatherData | null = null;
  error: string | null = null;
  recentSearches: string[] = [];
  maxSearches: number = 5;
  units: 'metric' | 'imperial' = 'metric';

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.city = localStorage.getItem('lastCity') || '';
    const savedUnits = localStorage.getItem('units');
    this.units = savedUnits === 'imperial' ? 'imperial' : 'metric';
    this.loadRecentSearches();
    if (this.city) {
      this.getWeather();
    }
  }

  loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    try {
      this.recentSearches = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(this.recentSearches)) {
        this.recentSearches = [];
      }
    } catch (e) {
      console.error('Error parsing recentSearches from localStorage:', e);
      this.recentSearches = [];
    }
  }

  saveRecentSearches() {
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  addRecentSearch(city: string) {
    city = city.trim();
    this.recentSearches = this.recentSearches.filter(
      c => c.toLowerCase() !== city.toLowerCase()
    );
    this.recentSearches.unshift(city);
    if (this.recentSearches.length > this.maxSearches) {
      this.recentSearches.pop();
    }
    this.saveRecentSearches();
  }

  getWeather(city?: string) {
    const searchCity = city || this.city;
    if (searchCity.trim()) {
      console.log('Fetching weather for:', searchCity, 'with units:', this.units);
      this.weather = null; // Clear weather to force UI update
      this.weatherService.getWeather(searchCity, this.units).subscribe({
        next: (data) => {
          console.log('API response:', data);
          this.weather = data;
          this.error = null;
          this.city = searchCity;
          localStorage.setItem('lastCity', searchCity);
          this.addRecentSearch(searchCity);
        },
        error: (err) => {
          console.error('API error:', err.message);
          this.error = err.message;
          this.weather = null;
        }
      });
    }
  }

  selectRecentSearch(city: string) {
    this.city = city;
    this.getWeather(city);
  }

  clearRecentSearches() {
    this.recentSearches = [];
    this.saveRecentSearches();
  }

  toggleUnits() {
    console.log('Units set to:', this.units);
    localStorage.setItem('units', this.units);
    if (this.city) {
      this.getWeather();
    }
  }
}