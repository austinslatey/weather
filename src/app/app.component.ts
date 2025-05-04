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


  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.city = localStorage.getItem('lastCity') || '';
    this.loadRecentSearches();
    if (this.city) {
      this.getWeather();
    }
  }

  loadRecentSearches(){
    const saved = localStorage.getItem('lastCity') || "";
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  saveRecentSearches(){
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  addRecentSearch(city: string) {
    // Remove duplicates (case-insensitive)
    city = city.trim();
    this.recentSearches = this.recentSearches.filter(
      c => c.toLowerCase() !== city.toLowerCase()
    );
    // Add new city to the start
    this.recentSearches.unshift(city);
    // Limit to maxSearches
    if (this.recentSearches.length > this.maxSearches) {
      this.recentSearches.pop();
    }
    // Save to localStorage
    this.saveRecentSearches();
  }

  getWeather(city?: string) {
    const searchCity = city || this.city;
    if (searchCity.trim()) {
      this.weatherService.getWeather(searchCity).subscribe({
        next: (data) => {
          this.weather = data;
          this.error = null;
          this.city = searchCity;
          localStorage.setItem('lastCity', searchCity);
          this.addRecentSearch(searchCity); // Add to recent searches
        },
        error: (err) => {
          this.error = err.message;
          this.weather = null;
        }
      });
    }
  }

  selectRecentSearch(city: string) {
    this.city = city;
    this.getWeather(city); // Fetch weather for selected city
  }

}