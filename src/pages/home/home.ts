import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, DirectoryEntry, Entry } from '@ionic-native/file';

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
    public file: File,
  ) {

  }

  public async addPhoto() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(async (imageData) => {
      this.imageData = imageData;

      debugger;

      try {
        const entry = await this.file.resolveLocalFilesystemUrl(imageData) as FileEntry;
        console.log('Got entry', entry);
        const photoFile = await new Promise((resolve, reject) => {
          entry.file(resolve, reject);
        });
        console.log('Got photo file', photoFile);
        const tempDirectory = await this.file.resolveLocalFilesystemUrl(this.file.tempDirectory) as DirectoryEntry;
        console.log('Got temp directory', tempDirectory);
        const copyFileResult = await new Promise<Entry>((resolve, reject) => {
          return entry.copyTo(tempDirectory, entry.name, resolve, reject);
        });
        console.log('Copied file', copyFileResult);

        const win = window as any;
        this.photo = {
          original: entry,
          originalFilePath: entry.toURL(),
          ionicNativeOriginal: win.Ionic.WebView.convertFileSrc(entry.toURL()),
          copy: copyFileResult,
          copyNative: copyFileResult.nativeURL,
          copyNativeSplit: copyFileResult.nativeURL.split('//')[1],
          ionicNativeCopy: win.Ionic.WebView.convertFileSrc(copyFileResult.nativeURL),
        };
      } catch (err) {
        console.log('Camera error inside promise: ', err);
      } 

      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // this.photo = 'data:image/jpeg;base64,' + imageData;
      console.log('Image data', imageData);
      console.log('Photo', this.photo);
    }, (err) => {
      console.log('Camera error: ', err);
    });
  }

}
