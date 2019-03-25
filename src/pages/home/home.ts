import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public photo;
  public imageData;

  constructor(
    public navCtrl: NavController,
    public camera: Camera,
  ) {

  }

  public addPhoto() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.imageData = imageData;
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // this.photo = 'data:image/jpeg;base64,' + imageData;
      this.photo = imageData;
      console.log(imageData);
    }, (err) => {
      // Handle error
    });
  }

}
