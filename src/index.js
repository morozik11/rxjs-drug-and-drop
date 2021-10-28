import { fromEvent, of, switchMap, takeUntil, map, throwError, catchError, mergeMap, delay } from 'rxjs'

const div = document.getElementById('dragAndDrop')
const target = document.getElementById('target')

const mousedown$ = fromEvent(div, 'mousedown')
const mousemove$ = fromEvent(document, 'mousemove')
const mouseup$ = fromEvent(document, 'mouseup')

let counter = 0

const average = window.innerHeight/2
const targetPosition = target.getBoundingClientRect()

const dragAndDrop = mousedown$.pipe(
  switchMap(startEvent => {
    let pageY = null
    return mousemove$.pipe(
      map(moveEvent => {
          pageY = moveEvent.pageY
          if (moveEvent.pageY >= average) {
            document.dispatchEvent(new Event("mouseup"))
          }
          return {
            type: 'mousemove',
            targetEvent: moveEvent,
            deltaX: moveEvent.pageX - startEvent.pageX,
            deltaY: moveEvent.pageY - startEvent.pageY,
            startOffsetX: startEvent.offsetX,
            startOffsetY: startEvent.offsetY
          }
        }
      ),
      takeUntil(mouseup$.pipe(
        switchMap(ev => {
          return throwError (() => ev)
        })
      )),
      catchError(() => {
        if (pageY >= average) {
          return of({type: 'add'}, {type: 'hide'}, {type: 'back'}, {type: 'show'}).pipe(
            mergeMap((item, index) => {
              return of(item).pipe(
                delay(index*1000)
              )
            })
          )
        }
        
        return of({type: 'back'})
      })
    )
  })
)

let subscription = dragAndDrop.subscribe(
  ev => {
    if (ev.type === 'mousemove') {
      if (div.style.transition != `none`) div.style.transition = `none`
      div.style.left = `${ev.targetEvent.x - ev.startOffsetX}px`
      div.style.top = `${ev.targetEvent.y - ev.startOffsetY}px`
    } else {
      if (ev.type == 'add') {
        div.style.transition = `left 1s, top 1s`
        div.style.left = `${targetPosition.x}px`
        div.style.top = `${targetPosition.y}px`
        target.innerText = `${counter = counter + 1}`
      }
      if (ev.type == 'hide') {
        div.style.display = `none`
      }
      if (ev.type == 'back') {
        div.style.transition = `left 1s, top 1s`
        div.style.left = `0px`
        div.style.top = `0px`
      }
      if (ev.type == 'show') {
        div.style.display = `block`
      }
    }
  }
)


