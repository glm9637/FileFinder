import {
  Directive,
  Input,
  ElementRef, // Changed from ViewContainerRef for simpler host element access
  OnDestroy,
  AfterContentInit,
  Renderer2, // For platform-agnostic class manipulation
  NgZone, // To run scroll events outside Angular's zone for performance
} from '@angular/core';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { takeUntil, auditTime, debounceTime, startWith } from 'rxjs/operators';

@Directive({
  selector: '[scrollState]',
  standalone: true, // Consider making it standalone if you're on Angular v14+
})
export class ScrollStateDirective implements OnDestroy, AfterContentInit {
  @Input() canScrollUpClass = 'can-scroll-up';
  @Input() canScrollDownClass = 'can-scroll-down';
  @Input() auditTimeMs = 100; // Adjusted auditTime
  @Input() scrollTargetSelector: string | undefined; // Optional: specify a selector for the scroll target

  private readonly destroy$ = new Subject<void>();
  private readonly hostElement: HTMLElement;
  private scrollableTarget: HTMLElement | Window = window; // Default to window or a specific element
  private scrollSubscription: Subscription | null = null; // To manage the subscription

  constructor(
    private readonly elRef: ElementRef<HTMLElement>, // Use ElementRef
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone
  ) {
    this.hostElement = elRef.nativeElement;
  }

  ngAfterContentInit(): void {
    // Defer finding the scrollable target until content is initialized
    // and potentially pdf-viewer has rendered its internal structure.
    // A small delay or waiting for a specific event like pdf-viewer's (after-load-complete)
    // might be more robust for complex children.
    Promise.resolve().then(() => this.initializeScroller());
  }

  // Public method that can be called if the scroll target appears/changes later
  public reinitializeScroller(): void {
    this.initializeScroller();
  }

  private initializeScroller(): void {
    // Common heuristic for ng2-pdf-viewer or similar
    const scrollTarget = this.hostElement.querySelector(
      '.ng2-pdf-viewer-container'
    );

    if (scrollTarget) {
      this.scrollableTarget = scrollTarget as HTMLElement;
      console.log(
        'ScrollStateDirective: Targetting scroll events on:',
        this.scrollableTarget
      );
    } else {
      console.warn(
        `ScrollStateDirective on ${this.hostElement.tagName}: Could not reliably determine the scrollable target. ` +
          `Scroll events might not be captured correctly. Consider using the 'scrollTargetSelector' input or ensuring the host/a designated child is scrollable.`
      );
      // Default to host, but it might not scroll.
      this.scrollableTarget = this.hostElement;
    }

    // Clean up previous listeners if any
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    this.destroy$.next(); // Also signal completion for takeUntil if re-initializing rapidly

    // Run scroll events outside Angular's zone to prevent excessive change detection
    this.ngZone.runOutsideAngular(() => {
      this.scrollSubscription = fromEvent(this.scrollableTarget, 'scroll')
        .pipe(
          auditTime(this.auditTimeMs),
          startWith(null), // Emit once initially to set classes
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.setClasses();
        });
    });

    // Also react to window resize as it can change scrollability
    fromEvent(window, 'resize')
      .pipe(debounceTime(this.auditTimeMs * 2), takeUntil(this.destroy$)) // Debounce for resize
      .subscribe(() => {
        this.setClasses();
      });

    // Initial set after finding the target
    this.setClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private setClasses(): void {
    if (!this.scrollableTarget) return;

    const target = this.scrollableTarget as HTMLElement; // Assuming it's an HTMLElement now
    let scrollTop = 0;
    let scrollHeight = 0;
    let clientHeight = 0;

    // Target is a specific child element
    scrollTop = target.scrollTop;
    scrollHeight = target.scrollHeight;
    clientHeight = target.clientHeight;

    // Add a small tolerance (e.g., 1px) for floating point comparisons
    const tolerance = 1;
    const canScrollUp = scrollTop > tolerance;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - tolerance;

    console.log('Scroll State:', {
      canScrollUp,
      canScrollDown,
      scrollTop,
      scrollHeight,
      clientHeight,
    });

    // Use Renderer2 for platform-agnostic class manipulation
    // Apply classes to the hostElement (the one with the directive), not the scrollableTarget itself

    if (canScrollUp) {
      this.renderer.addClass(this.hostElement, this.canScrollUpClass);
    } else {
      this.renderer.removeClass(this.hostElement, this.canScrollUpClass);
    }

    if (canScrollDown) {
      this.renderer.addClass(this.hostElement, this.canScrollDownClass);
    } else {
      this.renderer.removeClass(this.hostElement, this.canScrollDownClass);
    }
  }
}
