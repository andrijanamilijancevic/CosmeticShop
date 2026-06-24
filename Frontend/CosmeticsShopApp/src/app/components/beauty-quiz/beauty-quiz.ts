import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-beauty-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './beauty-quiz.html',
  styleUrl: './beauty-quiz.css'
})
export class BeautyQuizComponent {
  started = false;
  finished = false;
  currentQuestion = 0;
  answers: string[] = [];
  skinProfile = { type: '', concern: '', routine: '' };
  recommendations: any[] = [];

  quizImages: string[] = [
    '/image_22.jpg',
    '/image_20.jpg',
    '/image_21.jpg',
    '/image_22.jpg',
    '/image_20.jpg'
  ];

  questions = [
    {
      text: 'Kako bi opisali vaš tip kože?',
      options: [
        { label: 'Masna koža', value: 'oily', icon: '✨' },
        { label: 'Suva koža', value: 'dry', icon: '🌵' },
        { label: 'Kombinovana koža', value: 'combination', icon: '⚖️' },
        { label: 'Normalna koža', value: 'normal', icon: '🌸' }
      ]
    },
    {
      text: 'Koja je vaša glavna briga za kožu?',
      options: [
        { label: 'Akne i pore', value: 'acne', icon: '🔍' },
        { label: 'Starenje i bore', value: 'aging', icon: '⏳' },
        { label: 'Hiperpigmentacija', value: 'pigmentation', icon: '🎯' },
        { label: 'Dehidracija', value: 'hydration', icon: '💧' }
      ]
    },
    {
      text: 'Koliko vremena posvećujete nezi kože?',
      options: [
        { label: 'Manje od 5 minuta', value: 'minimal', icon: '⚡' },
        { label: '5-10 minuta', value: 'basic', icon: '🕐' },
        { label: '10-20 minuta', value: 'moderate', icon: '🕑' },
        { label: 'Više od 20 minuta', value: 'extensive', icon: '🕒' }
      ]
    },
    {
      text: 'Koji je vaš uzrast?',
      options: [
        { label: 'Do 25 godina', value: 'young', icon: '🌟' },
        { label: '25-35 godina', value: 'mid', icon: '💫' },
        { label: '35-50 godina', value: 'mature', icon: '✨' },
        { label: '50+ godina', value: 'senior', icon: '🌹' }
      ]
    },
    {
      text: 'Kako reaguje vaša koža na sunce?',
      options: [
        { label: 'Lako se opeče', value: 'sensitive', icon: '🌤️' },
        { label: 'Blago porumeni pa potamni', value: 'moderate', icon: '☀️' },
        { label: 'Brzo potamni', value: 'tan', icon: '🌞' },
        { label: 'Retko reaguje', value: 'resistant', icon: '🌈' }
      ]
    }
  ];

  start(): void {
    this.started = true;
    this.answers = new Array(this.questions.length).fill('');
  }

  selectAnswer(value: string): void {
    this.answers[this.currentQuestion] = value;
  }

  next(): void {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
    } else {
      this.calculateResults();
    }
  }

  prev(): void {
    if (this.currentQuestion > 0) this.currentQuestion--;
  }

  calculateResults(): void {
    const skinType = this.answers[0];
    const concern = this.answers[1];
    const time = this.answers[2];

    const skinTypeMap: any = {
      oily: 'Masna koža',
      dry: 'Suva koža',
      combination: 'Kombinovana koža',
      normal: 'Normalna koža'
    };

    const concernMap: any = {
      acne: 'Akne i pore',
      aging: 'Starenje i bore',
      pigmentation: 'Hiperpigmentacija',
      hydration: 'Dehidracija'
    };

    const routineMap: any = {
      minimal: 'Minimalistička',
      basic: 'Osnovna',
      moderate: 'Detaljna',
      extensive: 'Kompleksna'
    };

    this.skinProfile = {
      type: skinTypeMap[skinType] || 'Normalna koža',
      concern: concernMap[concern] || 'Opšta nega',
      routine: routineMap[time] || 'Osnovna'
    };

    this.recommendations = this.getRecommendations(skinType, concern);
    this.finished = true;
  }

  getRecommendations(skinType: string, concern: string): any[] {
    const base = [
      {
        icon: '🧴',
        category: 'Nega lica',
        description: this.getFaceCareTip(skinType),
        categoryId: 1
      },
      {
        icon: '💆',
        category: 'Serum',
        description: this.getSerumTip(concern),
        categoryId: 1
      },
      {
        icon: '🌸',
        category: 'Parfemi',
        description: 'Upotpunite svoju rutinu savršenim mirisom',
        categoryId: 4
      },
      {
        icon: '💄',
        category: 'Šminka',
        description: 'Istaknite svoju prirodnu lepotu',
        categoryId: 3
      }
    ];
    return base;
  }

  getFaceCareTip(skinType: string): string {
    const tips: any = {
      oily: 'Lagane, bez-uljne kreme koje kontrolišu sjaj',
      dry: 'Bogati hidratantni losioni i kreme sa hijaluronskom kiselinom',
      combination: 'Balansiranje T-zone sa laganim kremama',
      normal: 'Održavanje hidratacije sa svakodnevnom kremom'
    };
    return tips[skinType] || 'Dnevna hidratantna krema za vašu kožu';
  }

  getSerumTip(concern: string): string {
    const tips: any = {
      acne: 'Serum sa salicilnom kiselinom za čišćenje pora',
      aging: 'Anti-age serum sa retinolom i vitaminom C',
      pigmentation: 'Serum za ujednačavanje tena sa niacinamidom',
      hydration: 'Hijaluronski serum za duboku hidrataciju'
    };
    return tips[concern] || 'Hranljivi serum za sjaj kože';
  }

  restart(): void {
    this.started = false;
    this.finished = false;
    this.currentQuestion = 0;
    this.answers = [];
  }
}