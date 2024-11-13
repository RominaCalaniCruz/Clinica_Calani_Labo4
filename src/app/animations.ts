import { trigger, group, style, animate, transition, query, animateChild, keyframes, AnimationKeyframesSequenceMetadata, } from '@angular/animations';

function slideRight() {
  return [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [style({ left: '-100%' })], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('500ms ease-out', style({ left: '100%' }))], { optional: true }),
      query(':enter', [animate('500ms ease-out', style({ left: '0%' }))], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ];
}
function slideLeft() {
  return [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [style({ left: '100%' })], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('500ms ease-out', style({ left: '-100%' }))], { optional: true }),
      query(':enter', [animate('500ms ease-out', style({ left: '0%' }))], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ];
}
function rotateComponent() {
  return [
    style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'rotateY(-90deg)', opacity: 0 })
      ], { optional: true }),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':leave', [
          animate('600ms ease-in', style({ transform: 'rotateY(90deg)', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('600ms ease-out', style({ transform: 'rotateY(0deg)', opacity: 1 }))
        ], { optional: true }),
      ]),
      query(':enter', animateChild(), { optional: true }),
  ];
}

function desvanecerComponente() {
  return [
    style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ], { optional: true }),
  
      query(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' })
      ], { optional: true }),
      
      query(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'scale(0.9)' }))
      ], { optional: true }),

      query(':enter', [
        animate('200ms ease', style({ opacity: 1, transform: 'scale(1)' }))
      ], { optional: true }),
  ];
}
export const slideInAnimation =
  trigger('routeAnimations', [
    transition('registro <=> login', rotateComponent()),
    transition('* => home', slideRight()),
    transition('* => mi-perfil', slideRight()),
    transition('* => sacar-turno', desvanecerComponente()),
    transition('* => usuarios', slideLeft()),
    transition('* => mis-turnos', rotateComponent()),
    transition('* => turnos', slideLeft()),
    transition('* => pacientes', slideLeft())


  ]);