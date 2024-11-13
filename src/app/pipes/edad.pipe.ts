import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edad',
  standalone: true
})
export class EdadPipe implements PipeTransform {

  transform(value: number): string | null {
    if (value) {
      return `${value} años`;
    }
    return "-";
  }

}
