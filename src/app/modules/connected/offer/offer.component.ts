import { Component, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OfferMode } from './offer.enum';
import { ConnectedRtcService } from '../connected-rtc.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { LampComponent } from '../lamp/lamp.component';

@Component({
  standalone: true,
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  imports: [SharedModule, LampComponent],
})
export class OfferComponent {
  /* -------------------------------------------------------------------------- */
  /*                                   Inject                                   */
  /* -------------------------------------------------------------------------- */
  _connectedRtcService = inject(ConnectedRtcService);

  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */
  constructor(private _zone: NgZone) {
    this._peer.onconnectionstatechange = () => {
      this._zone.run(() => {
        this.onNext();
        // alert('แจ้งเตือนการเชื่อมต่อ');
        switch (this._peer.connectionState) {
          case 'connected':
            // alert('เชื่อมต่อสําเร็จ');
            this.connected = true;
            break;
          case 'disconnected':
            // alert('เชื่อมต่อไม่สําเร็จ');
            this.connected = false;
            break;
        }
      });
    };
  }

  private _peer: RTCPeerConnection & { dc?: RTCDataChannel } =
    new RTCPeerConnection();

  /* -------------------------------------------------------------------------- */
  /*                                     Get                                    */
  /* -------------------------------------------------------------------------- */

  public get channel() {
    return this._peer.dc;
  }

  get OfferMode(): typeof OfferMode {
    return OfferMode;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Variables                                 */
  /* -------------------------------------------------------------------------- */
  offerData: string = '';
  answerData: string = '';
  connected: boolean = false;
  messageItems: any[] = [];
  mode$ = new BehaviorSubject<OfferMode>(OfferMode.CREATE_OFFER);

  /* -------------------------------------------------------------------------- */
  /*                                  Functions                                 */
  /* -------------------------------------------------------------------------- */
  /** เมื่อกดปุ่มสร้างข้อมูล Offer */
  createOffer() {
    this._peer.dc = this._peer.createDataChannel('channel');
    this._peer.dc.onmessage = (ev) => this._onChannelMessage(ev);

    this._peer.onicecandidate = (ev) => {
      if (!ev.candidate) return;
      this._zone.run(() => {
        this.offerData = JSON.stringify(this._peer.localDescription);
      });
    };
    this._peer.createOffer().then((offer) => {
      this._peer.setLocalDescription(offer);
      this.offerData = JSON.stringify(offer);
    });
  }

  onNext() {
    if (this.offerData === '') {
      alert('กรุณาสร้างข้อมูล Offer');
    } else {
      this.mode$.next(OfferMode.APPROVE_ANSWER);
    }
  }

  onCopy() {
    const copy = document.getElementById('offer') as HTMLInputElement;
    copy?.select();
    document.execCommand('copy');
  }

  /** ยืนยันข้อมูล Answer */
  confirmAnswer() {
    if (this.answerData === '') {
      alert('กรุณากรอกข้อมูล Answer');
    }
    this._peer.setRemoteDescription(JSON.parse(this.answerData));
  }

  /** เมื่ออีกเครื่องส่งข้อความมา */
  private _onChannelMessage(ev: MessageEvent<string>) {
    this._zone.run(() => {
      this.messageItems.push(ev.data);
    });
  }
}
