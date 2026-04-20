import { Component } from '@angular/core';
import { BannerCarouselComponent } from "./components/banner-carousel/banner-carousel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
