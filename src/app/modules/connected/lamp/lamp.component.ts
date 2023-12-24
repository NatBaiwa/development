import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-lamp',
  templateUrl: './lamp.component.html',
  styleUrls: ['./lamp.component.scss'],
  imports: [SharedModule],
})
export class LampComponent implements AfterViewInit, OnInit {
  public userAgent = new BehaviorSubject<string>('');
  public platform = new BehaviorSubject<string>('');

  // data = [
  //   {
  //     message:
  //       'https://www.central.co.th/e-shopping/wp-content/uploads/2020/12/CUTE-KITTY.jpg',
  //   },
  //   {
  //     message:
  //       'https://www.central.co.th/e-shopping/wp-content/uploads/2020/12/CUTE-KITTY.jpg',
  //   },
  //   {
  //     message:
  //       'https://www.central.co.th/e-shopping/wp-content/uploads/2020/12/CUTE-KITTY.jpg',
  //   },
  //   {
  //     message:
  //       'https://www.central.co.th/e-shopping/wp-content/uploads/2020/12/CUTE-KITTY.jpg',
  //   },
  // ];

  @Input('channel') channel?: RTCDataChannel;
  @Input('items') items: any[] = [];
  @Input('drawing') drawing: boolean = false;
  @Input('display') display: boolean = false;
  @Input('latestIndex') set latestIndex(value: number) {
    this.showImageAnimationByIndex = true;
    this.imageAnimationByIndex = value - 1;

    setTimeout(() => {
      this.showImageAnimationByIndex = false;
    }, 800)
  }
  @Output('itemsChange') itemsChange = new EventEmitter<any[]>();

  showSendImageAnimation: boolean = false;
  showImageAnimationByIndex: boolean = false;
  imageAnimationByIndex: number = 0;

  sendData() {
    const image = this.canvas.nativeElement.toDataURL('image/png');
    console.log(image);
    this.showSendImageAnimation = true;
    setTimeout(() => {
      this.items.push(image);
      this.itemsChange.emit(this.items);
      this.channel?.send(image);
      this.clearCanvas();
      this.showSendImageAnimation = false;
    }, 800)
  }

  ngOnInit(): void {
    this.userAgent = new BehaviorSubject<string>(window.navigator.userAgent);
    this.platform = new BehaviorSubject<string>(window.navigator.platform);
  }

  @ViewChild('drawingCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawingCanvas', { static: true }) canvasRef!: ElementRef;

  private context!: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private drawingHistory: any[] = [];
  private currentHistoryIndex: number = -1;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    if (!this.context) {
      // Handle the error or return
      return;
    }
    this.setCanvasSize();
    this.setupCanvas();
  }

  setCanvasSize() {
    const container = document.getElementById('draw-area');
    if (!container) return;

    const canvas = this.canvasRef.nativeElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Set canvas width and height
    // this.renderer.setAttribute(canvas, 'width', containerWidth.toString());
    // this.renderer.setAttribute(canvas, 'height', containerHeight.toString());
    this.renderer.setAttribute(canvas, 'width', '431px');
    this.renderer.setAttribute(canvas, 'height', '409px');
  }

  private setupCanvas(): void {
    // Get the container element
    const container = this.el.nativeElement.parentElement;

    // Set the canvas width and height to match the container
    this.renderer.setStyle(container, 'position', 'relative');
    this.renderer.setStyle(container, 'overflow', 'hidden');
    this.renderer.setStyle(
      this.el.nativeElement,
      'width',
      container.clientWidth + 'px'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'height',
      container.clientHeight + 'px'
    );

    this.context.lineWidth = 5;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';

    this.renderer.listen(this.canvas.nativeElement, 'touchstart', (e) =>
      this.startOrDraw(e)
    );
    this.renderer.listen(this.canvas.nativeElement, 'touchend', () =>
      this.stopDrawing()
    );
    this.renderer.listen(this.canvas.nativeElement, 'touchmove', (e) =>
      this.startOrDraw(e)
    );

    // Initial state for undo/redo
    this.saveState();
  }

  private startOrDraw(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0] as any;
    this.isDrawing = true;

    if (!this.isDrawing) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.context.lineTo(x, y);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(x, y);
  }

  private stopDrawing(): void {
    this.isDrawing = false;
    this.context.beginPath();
    // Save the state after each drawing action
    this.saveState();
  }

  saveDrawing(): void {
    try {
      const image = this.canvas.nativeElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'drawing.png';
      link.click();
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  }

  clearCanvas(): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    // Save the state after clearing the canvas
    this.saveState();
  }

  undo(): void {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      this.restoreState();
    }
  }

  redo(): void {
    if (this.currentHistoryIndex < this.drawingHistory.length - 1) {
      this.currentHistoryIndex++;
      this.restoreState();
    }
  }

  private saveState(): void {
    const imageData = this.context.getImageData(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.drawingHistory = this.drawingHistory.slice(
      0,
      this.currentHistoryIndex + 1
    );
    this.drawingHistory.push(imageData);
    this.currentHistoryIndex = this.drawingHistory.length - 1;
  }

  private restoreState(): void {
    const imageData = this.drawingHistory[this.currentHistoryIndex];
    this.context.putImageData(imageData, 0, 0);
  }
}
