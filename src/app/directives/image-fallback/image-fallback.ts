import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core'

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallback {
  // Dependency Injections
  private readonly imgElement: ElementRef<HTMLImageElement> = inject(ElementRef<HTMLImageElement>)

  @Input() public appImageFallback = 'assets/cover_not_available.png'

  @HostListener('error')
  private onError = () => {
    this.imgElement.nativeElement.src = this.appImageFallback
  }
}
