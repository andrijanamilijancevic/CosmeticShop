import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shade-finder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shade-finder.html',
  styleUrl: './shade-finder.css'
})
export class ShadeFinderComponent {
  selectedTone = '';
  selectedToneName = '';
  selectedUndertone = '';
  selectedCoverage = '';
  result: any = null;

  isDarkSkinSelected(): boolean {
    const darkTones = ['medium-tan', 'tan', 'deep', 'rich', 'ebony'];
    return darkTones.includes(this.selectedTone);
  }

  skinTones = [
    { value: 'porcelain', label: 'Porcelain', color: '#F5E6D3' },
    { value: 'fair', label: 'Fair', color: '#F0D5B8' },
    { value: 'light', label: 'Light', color: '#E8C49A' },
    { value: 'light-medium', label: 'Light Medium', color: '#D4A574' },
    { value: 'medium', label: 'Medium', color: '#C4915A' },
    { value: 'medium-tan', label: 'Medium Tan', color: '#B07D45' },
    { value: 'tan', label: 'Tan', color: '#9B6B35' },
    { value: 'deep', label: 'Deep', color: '#7A4E2D' },
    { value: 'rich', label: 'Rich', color: '#5C3418' },
    { value: 'ebony', label: 'Ebony', color: '#3D1F0D' }
  ];

  undertones = [
    { value: 'cool', label: 'Hladan (ružičast/plavičast)', color: '#E8B4C8' },
    { value: 'warm', label: 'Topao (žućkast/narandžast)', color: '#F4C87A' },
    { value: 'neutral', label: 'Neutralan (mešavina)', color: '#D4B896' },
    { value: 'olive', label: 'Maslinast (zelenkast)', color: '#C4B882' }
  ];

  coverageOptions = [
    { value: 'light', label: 'Lagana', icon: '✨', desc: 'Prirodan, providni izgled' },
    { value: 'medium', label: 'Srednja', icon: '💫', desc: 'Ujednačen ten' },
    { value: 'full', label: 'Puna', icon: '⭐', desc: 'Maksimalna pokrivenost' }
  ];

  selectTone(tone: any): void {
    this.selectedTone = tone.value;
    this.selectedToneName = tone.label;
    this.result = null;
  }

  selectUndertone(undertone: any): void {
    this.selectedUndertone = undertone.value;
    this.result = null;
  }

  findShade(): void {
    const shade = this.calculateShade();
    this.result = shade;
  }

  calculateShade(): any {
    const shadeMap: any = {
      'porcelain-cool': { shade: 'N10 Ivory Rose', color: '#F5E0D8', desc: 'Najsvetlija nijansa sa ružičastim podtonom' },
      'porcelain-warm': { shade: 'W10 Vanilla', color: '#F5E8D0', desc: 'Najsvetlija nijansa sa zlatnim podtonom' },
      'porcelain-neutral': { shade: 'NC10 Porcelain', color: '#F5E4D4', desc: 'Najsvetlija neutralna nijansa' },
      'porcelain-olive': { shade: 'O10 Alabaster', color: '#F2E8D0', desc: 'Svetla nijansa sa maslinastim podtonom' },
      'fair-cool': { shade: 'N20 Shell Pink', color: '#F0D8CC', desc: 'Svetla nijansa sa ružičastim tonom' },
      'fair-warm': { shade: 'W20 Ivory', color: '#F0DEC0', desc: 'Svetla topla nijansa' },
      'fair-neutral': { shade: 'NC20 Fair', color: '#EDDCC8', desc: 'Svetla neutralna nijansa' },
      'fair-olive': { shade: 'O20 Sand', color: '#EAD8B8', desc: 'Svetla nijansa sa zelenkastim tonom' },
      'light-cool': { shade: 'N30 Petal', color: '#E8C8B8', desc: 'Lagana nijansa sa roze podtonom' },
      'light-warm': { shade: 'W30 Honey', color: '#E8D0A0', desc: 'Topla svetla nijansa' },
      'light-neutral': { shade: 'NC30 Natural', color: '#E5CCAA', desc: 'Prirodna svetla nijansa' },
      'light-olive': { shade: 'O30 Buff', color: '#E0CC98', desc: 'Svetlo maslinasta nijansa' },
      'medium-cool': { shade: 'N40 Rose Beige', color: '#D4A890', desc: 'Srednja nijansa sa roze podtonom' },
      'medium-warm': { shade: 'W40 Golden Beige', color: '#D4B07A', desc: 'Zlatna srednja nijansa' },
      'medium-neutral': { shade: 'NC40 Medium', color: '#D0AA88', desc: 'Neutralna srednja nijansa' },
      'medium-olive': { shade: 'O40 Khaki', color: '#C8A870', desc: 'Srednja maslinasta nijansa' },
      'tan-cool': { shade: 'N50 Warm Cocoa', color: '#A87860', desc: 'Tamna nijansa sa hladnim tonom' },
      'tan-warm': { shade: 'W50 Caramel', color: '#A87840', desc: 'Topla karamel nijansa' },
      'tan-neutral': { shade: 'NC50 Tan', color: '#A87850', desc: 'Neutralna tan nijansa' },
      'tan-olive': { shade: 'O50 Olive Tan', color: '#A07840', desc: 'Maslinasto tan nijansa' },
      'deep-cool': { shade: 'N60 Mahogany', color: '#704030', desc: 'Duboka nijansa sa hladnim podtonom' },
      'deep-warm': { shade: 'W60 Toffee', color: '#785028', desc: 'Topla duboka nijansa' },
      'deep-neutral': { shade: 'NC60 Deep', color: '#745038', desc: 'Neutralna duboka nijansa' },
      'deep-olive': { shade: 'O60 Espresso', color: '#6C4C28', desc: 'Duboka maslinasta nijansa' },
      'ebony-cool': { shade: 'N70 Obsidian', color: '#3C2018', desc: 'Najtamnija nijansa sa hladnim podtonom' },
      'ebony-warm': { shade: 'W70 Truffle', color: '#402418', desc: 'Najtamnija topla nijansa' },
      'ebony-neutral': { shade: 'NC70 Ebony', color: '#3C2218', desc: 'Neutralna najtamnija nijansa' },
      'ebony-olive': { shade: 'O70 Onyx', color: '#382018', desc: 'Najtamnija maslinasta nijansa' },
    };

    const key = `${this.selectedTone}-${this.selectedUndertone}`;
    const baseShade = shadeMap[key] || shadeMap['medium-neutral'];

    const coverageMap: any = {
      light: 'Lagana pokrivenost',
      medium: 'Srednja pokrivenost',
      full: 'Puna pokrivenost'
    };

    const undertoneMap: any = {
      cool: 'Hladan podton',
      warm: 'Topao podton',
      neutral: 'Neutralan podton',
      olive: 'Maslinast podton'
    };

    const toneObj = this.skinTones.find(t => t.value === this.selectedTone);

    return {
      ...baseShade,
      tone: toneObj?.label || '',
      undertone: undertoneMap[this.selectedUndertone],
      coverage: coverageMap[this.selectedCoverage],
      similar: this.getSimilarShades(baseShade.color)
    };
  }

  getSimilarShades(baseColor: string): any[] {
    return [
      { name: 'Lighter', color: this.adjustColor(baseColor, 20) },
      { name: 'Match', color: baseColor },
      { name: 'Darker', color: this.adjustColor(baseColor, -20) },
      { name: 'Warmer', color: this.adjustColor(baseColor, 10, true) },
      { name: 'Cooler', color: this.adjustColor(baseColor, -10, false, true) }
    ];
  }

  adjustColor(hex: string, amount: number, warmer = false, cooler = false): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const nr = Math.min(255, Math.max(0, r + amount + (warmer ? 10 : cooler ? -5 : 0)));
    const ng = Math.min(255, Math.max(0, g + amount));
    const nb = Math.min(255, Math.max(0, b + amount + (warmer ? -5 : cooler ? 10 : 0)));

    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  }

  reset(): void {
    this.selectedTone = '';
    this.selectedToneName = '';
    this.selectedUndertone = '';
    this.selectedCoverage = '';
    this.result = null;
  }
}