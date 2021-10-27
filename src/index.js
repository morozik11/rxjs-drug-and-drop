import { fromEvent, of, switchMap, takeUntil, map, throwError, catchError, tap } from 'rxjs'

const div = document.getElementById('dragAndDrop')
const target = document.getElementById('target')

const mousedown$ = fromEvent(div, 'mousedown')
const mousemove$ = fromEvent(document, 'mousemove')
const mouseup$ = fromEvent(document, 'mouseup')

let counter = 0

const average = window.outerHeight/2 + window.outerHeight/4
const targetPosition = target.getBoundingClientRect()

const dragAndDrop = mousedown$.pipe(
  switchMap(startEvent => {
    return mousemove$.pipe(
      map(moveEvent => ({
        type: 'mousemove',
        targetEvent: moveEvent,
        deltaX: moveEvent.pageX - startEvent.pageX,
        deltaY: moveEvent.pageY - startEvent.pageY,
        startOffsetX: startEvent.offsetX,
        startOffsetY: startEvent.offsetY
      })),
      takeUntil(mouseup$.pipe(
        switchMap(ev => throwError (() => ev))
      )),  
      switchMap(ev => {
        if (ev.targetEvent.pageY >= average) {
          return of({type: 'add', targetEvent: ev}).pipe(
            tap(() => {
              target.style.backgroundColor = 'rgb(118, 201, 145)'
            })
          )
        }
        return of(ev)
      }),
      catchError(() => of([]).pipe(
        switchMap(eve => of({type: 'back', targetEvent: eve}).pipe())
      ))
    )
  })
)

const makeSubscription = (container) => {
  container = dragAndDrop.subscribe(
    ev => {
      if (ev.type === 'mousemove') {
        if (div.style.transition != `none`) div.style.transition = `none`
        div.style.left = `${ev.targetEvent.x - ev.startOffsetX}px`
        div.style.top = `${ev.targetEvent.y - ev.startOffsetY}px`
      } else {
        if (ev.type == 'back') {
          div.style.transition = `left 1s, top 1s`
          div.style.left = `0px`
          div.style.top = `0px`
        }
        if (ev.type == 'add') {
          container.unsubscribe()
          target.innerText = `${counter = counter + 1}`
          div.style.transition = `left 1s, top 1s`
          div.style.left = `${targetPosition.x}px`
          div.style.top = `${targetPosition.y}px`
          setTimeout(() => {
            div.style.display = 'none'
            div.style.left = `0px`
            div.style.top = `0px`
            makeSubscription(container)  
          },1000)
          setTimeout(() => {
            div.style.display = 'block'
            target.style.backgroundColor = 'white'
          },2000)
        }
      }
    }
  )
}

let subscription = null
makeSubscription(subscription)


