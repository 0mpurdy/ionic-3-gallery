import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, DirectoryEntry, Entry } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  JSON = JSON;

  public photo;
  public photoUrls = [];
  public imageData;

  constructor(
    public navCtrl: NavController,
    public camera: Camera,
    public file: File,
  ) {

  }

  public async addPhoto() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(async (imageData) => {
      this.imageData = imageData;

      // let photo = {} as any;
      // this.photoUrls = [];


      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.photo = 'data:image/jpeg;base64,' + imageData;
      console.log('Image data', imageData);
      console.log('Photo', this.photo);
    }, (err) => {
      console.log('Camera error: ', err);
    });
  }

}
